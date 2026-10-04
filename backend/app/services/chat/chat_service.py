"""app/services/chat_service.py"""

import asyncio
import json
import logging 

from google.genai import errors as genai_errors
from google.genai import types

from app.core.gemini_client import gemini_client
from app.services.chat.call_llm import call_llm
from app.services.chat.citations import extract_used_ids, finalize_answer, strip_citations
from app.services.retrieval.embedding_service import embed_text
from app.services.chat.prompts import REWRITE_PROMPT, SYSTEM_PROMPT
from app.services.retrieval.vector_store import query_chunks 
from app.utils.text_utils import strip_markdown

logger = logging.getLogger(__name__) 

GEMINI_CHAT_MODEL = "gemini-2.5-flash"
TOP_K = 6
MAX_CONTEXT_CHARS = 24000
HISTORY_MESSAGES = 6  # last 3 Q/A pairs
# Chroma distance. None = filter off. Pehle logs me distances dekho, phir tune karo (e.g. 0.8).
MAX_DISTANCE: float | None = None

_RESET = object()  # fallback ke time stream restart ka signal

FALLBACK_EMPTY_NOTEBOOK = (
    "I don't have any content to search for this notebook yet. "
    "If you just uploaded a document, it might still be processing — try again in a moment."
)
FALLBACK_NO_MATCH = "The document does not seem to contain information related to this question."


# ---------- small helpers ----------

def _sse(event: str, data: dict | str) -> str:
    payload = data if isinstance(data, str) else json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"


def _is_rate_limit_error(err: Exception) -> bool:
    if isinstance(err, genai_errors.ClientError) and getattr(err, "code", None) == 429:
        return True
    return "429" in str(err) or "RESOURCE_EXHAUSTED" in str(err)


async def _collect(stream) -> str:
    return "".join([chunk async for chunk in stream])


def _recent_history(history: list[dict] | None) -> list[dict]:
    """Sirf user/assistant turns, purane citation markers hata ke."""
    turns = [h for h in (history or []) if h.get("role") in ("user", "assistant") and h.get("content")]
    return [
        {"role": h["role"], "content": strip_citations(h["content"])}
        for h in turns[-HISTORY_MESSAGES:]
    ]


# ---------- retrieval ----------

# def _format_location(meta: dict) -> str:
#     """Citation chip ka label. PDF=page, code=lines, notes=section, warna chunk number."""
#     if meta.get("page") is not None:
#         return f"Page {meta['page']}"
#     if meta.get("start_line") is not None:
#         return f"Lines {meta['start_line']}–{meta.get('end_line', meta['start_line'])}"
#     if meta.get("section"):
#         return str(meta["section"])
#     if meta.get("chunk_index") is not None:
#         return f"Section {int(meta['chunk_index']) + 1}"
#     return "Document"


def _format_location(meta: dict) -> str:
    """Citation chip ka label. Code/text=lines, PDF=page, notes=section, warna chunk number.
    Lines pehle: txt chunks me page bhi hota hai par wo asli page nahi, bas chunk number hai."""
    if meta.get("start_line") is not None:
        return f"Lines {meta['start_line']}–{meta.get('end_line', meta['start_line'])}"
    if meta.get("page") is not None:
        return f"Page {meta['page']}"
    if meta.get("section"):
        return str(meta["section"])
    if meta.get("chunk_index") is not None:
        return f"Section {int(meta['chunk_index']) + 1}" 
    return "Document"


def _build_sources(results: dict) -> list[dict]:
    documents = (results.get("documents") or [[]])[0]
    metadatas = (results.get("metadatas") or [[]])[0]
    distances = (results.get("distances") or [[]])[0] or [None] * len(documents)

    logger.debug("retrieval distances: %s", distances)

    kept = [
        (text, meta or {})
        for text, meta, dist in zip(documents, metadatas, distances)
        if MAX_DISTANCE is None or dist is None or dist <= MAX_DISTANCE
    ]
    return [
        {
            "id": i + 1,
            "page": meta.get("page"),
            "label": _format_location(meta),  
            "snippet": text,                  # display ke liye (markdown intact)
            "plain": strip_markdown(text),    # sirf PDF highlight search ke liye
        }
        for i, (text, meta) in enumerate(kept)
    ]


def _fit_sources(sources: list[dict], max_chars: int) -> list[dict]:
    """Poore chunk drop karo, beech se kaat ke adhura chunk mat bhejo."""
    fitted, total = [], 0
    for s in sources:
        size = len(s["snippet"]) + 100
        if fitted and total + size > max_chars:
            logger.warning("Context limit hit: using %d of %d sources", len(fitted), len(sources))
            break
        fitted.append(s)
        total += size
    return fitted


def _format_source_block(s: dict) -> str:
    safe = s["snippet"].replace("</source", "<\\/source")  # document se tag-injection roko
    return f'<source id="S{s["id"]}" location="{s["label"]}">\n{safe}\n</source>'


async def _rewrite_question(question: str, history: list[dict]) -> str:
    """Follow-up ("isko explain karo") ko standalone question banao, taaki retrieval sahi chale."""
    if not history:
        return question

    transcript = "\n".join(f"{h['role'].upper()}: {h['content'][:500]}" for h in history)
    messages = [
        {"role": "system", "content": REWRITE_PROMPT},
        {"role": "user", "content": f"Conversation:\n{transcript}\n\nFollow-up question: {question}\n\nStandalone question:"},
    ]
    try:
        rewritten = (await _collect(call_llm(messages))).strip()
    except Exception:
        logger.warning("Question rewrite failed, using original question", exc_info=True)
        return question
    return rewritten or question


# ---------- generation ----------

async def _gemini_stream(messages: list[dict]):
    system = "\n\n".join(m["content"] for m in messages if m["role"] == "system")
    contents = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in messages
        if m["role"] != "system"
    ]
    stream = await gemini_client.aio.models.generate_content_stream(
        model=GEMINI_CHAT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system),
    )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text


async def _generate(messages: list[dict], notebook_id: str):
    """Primary (Groq) -> fallback (Gemini). Text chunks yield karta hai, restart pe _RESET."""
    emitted = False
    try:
        async for chunk in call_llm(messages):
            emitted = True
            yield chunk
        return
    except Exception as err:
        logger.warning(
            "Primary LLM failed (rate_limited=%s) notebook_id=%s: %s",
            _is_rate_limit_error(err), notebook_id, err,
        )
        if emitted:
            yield _RESET

    async for chunk in _gemini_stream(messages):
        yield chunk


# ---------- main entry ----------

async def stream_answer(notebook_id: str, question: str, history: list[dict] | None = None):
    history = _recent_history(history)

    search_query = await _rewrite_question(question, history)
    query_embedding = await asyncio.to_thread(embed_text, search_query, "retrieval_query")
    results = await asyncio.to_thread(query_chunks, notebook_id, query_embedding, top_k=TOP_K)

    if not (results.get("documents") or [[]])[0]:
        yield _sse("citations", {"citations": []})
        yield _sse("token", {"content": FALLBACK_EMPTY_NOTEBOOK})
        yield _sse("done", {"answer": FALLBACK_EMPTY_NOTEBOOK, "citations": []})
        return

    sources = _fit_sources(_build_sources(results), MAX_CONTEXT_CHARS)

    if not sources:  # sab chunks relevance threshold se bahar
        yield _sse("citations", {"citations": []})
        yield _sse("token", {"content": FALLBACK_NO_MATCH})
        yield _sse("done", {"answer": FALLBACK_NO_MATCH, "citations": []})
        return

    yield _sse("citations", {"citations": sources})

    context = "\n\n".join(_format_source_block(s) for s in sources)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history,
        {"role": "user", "content": f"<sources>\n{context}\n</sources>\n\nQuestion: {question}"},
    ]

    full_answer = ""
    try:
        async for piece in _generate(messages, notebook_id):
            if piece is _RESET:
                full_answer = ""
                yield _sse("reset", {})
                continue
            full_answer += piece
            yield _sse("token", {"content": piece})
    except Exception:
        logger.exception("All LLM providers failed for notebook_id=%s", notebook_id)
        yield _sse("error", {"message": "Something went wrong while generating the answer. Please try again."})
        return

    if not full_answer:
        logger.warning("Empty answer from all providers for notebook_id=%s", notebook_id)
        yield _sse("error", {"message": "Couldn't generate an answer for this question. Please try again."})
        return

    full_answer = finalize_answer(full_answer)
    used_ids = set(extract_used_ids(full_answer, {s["id"] for s in sources}))
    final_citations = [s for s in sources if s["id"] in used_ids]

    yield _sse("done", {"answer": full_answer, "citations": final_citations})