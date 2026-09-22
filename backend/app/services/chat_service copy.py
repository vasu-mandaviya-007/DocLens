


# import asyncio
# import json
# from google.genai import errors as genai_errors
# from app.core.gemini_client import gemini_client
# from app.core.groq_client import groq_async_client
# from app.services.embedding_service import embed_text
# from app.services.vector_store import query_chunks

# GEMINI_CHAT_MODEL = "gemini-2.5-flash"
# GROQ_CHAT_MODEL = "openai/gpt-oss-120b" 
# TOP_K = 8

# SYSTEM_PROMPT = """You are a helpful assistant that answers questions strictly based on the provided document excerpts.

# Rules:
# - Only use information present in the context below to answer. Do not use outside knowledge.
# - If the answer is not present in the context, clearly say the document does not contain this information.
# - If the topic has multiple distinct aspects or dimensions (e.g. a comparison, a multi-part concept), organize the answer into clearly labeled sections using markdown headings (###) and bullet points — don't compress everything into one or two lines.
# - Use **bold** for key terms, and bullet/numbered lists wherever it improves readability.
# - Be thorough and cover every relevant angle present in the context, but stay grounded — don't pad with generic filler or restate the question.
# - End with one short, relevant follow-up question or suggestion the user might want to explore next, based on the document content.
# """


# def _is_rate_limit_error(err: Exception) -> bool:
#     if isinstance(err, genai_errors.ClientError) and getattr(err, "code", None) == 429:
#         return True
#     return "429" in str(err) or "RESOURCE_EXHAUSTED" in str(err) 


# def _sse(event: str, data: dict | str) -> str:
#     """Ek Server-Sent-Event line format karta he."""
#     payload = data if isinstance(data, str) else json.dumps(data)
#     return f"event: {event}\ndata: {payload}\n\n"


# async def stream_answer(notebook_id: str, question: str):
#     """
#     Async generator — SSE format me events yield karta he:
#     - 'citations' event: pehle, ek baar (sources vector-search se already mil jaate hain, LLM se pehle)
#     - 'token' event: har baar jab naya text-chunk aaye
#     - 'done' event: aakhir me, poora accumulated answer text ke saath (DB save ke liye router isko use karega)
#     - 'error' event: agar kuch fail ho jaaye
#     """
#     query_embedding = await asyncio.to_thread(embed_text, question, "retrieval_query")
#     results = await asyncio.to_thread(query_chunks, notebook_id, query_embedding, TOP_K)

#     documents = results.get("documents", [[]])[0]
#     metadatas = results.get("metadatas", [[]])[0]

#     if not documents:
#         fallback_text = "I don't have any content to search for this notebook yet. If you just uploaded a document, it might still be processing — try again in a moment."
#         yield _sse("citations", {"citations": []})
#         yield _sse("token", fallback_text)
#         yield _sse("done", {"answer": fallback_text, "citations": []})
#         return

#     citations = [
#         {"page": meta["page"], "snippet": text[:200]}
#         for text, meta in zip(documents, metadatas)
#     ]
#     yield _sse("citations", {"citations": citations})

#     context_blocks = [
#         f"[Page {meta['page']}]\n{text}"
#         for text, meta in zip(documents, metadatas)
#     ]
#     context = "\n\n---\n\n".join(context_blocks)
#     prompt = f"{SYSTEM_PROMPT}\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:"

#     full_answer = ""

#     try:
#         # Groq stream shuru karo — agar shuruaat me hi rate-limit lage, Gemini pe switch karenge
#         # stream = await asyncio.to_thread(
#         #     groq_client.chat.completions.create,
#         #     model=GROQ_CHAT_MODEL,
#         #     messages=[{"role": "user", "content": prompt}],
#         #     stream=True,
#         # )

#         # for chunk in stream:
#         #     delta = chunk.choices[0].delta.content
#         #     if delta:
#         #         full_answer += delta
#         #         yield _sse("token", delta)

#         stream = await groq_async_client.chat.completions.create(
#             model=GROQ_CHAT_MODEL,
#             messages=[{"role": "user", "content": prompt}],
#             stream=True,
#         )

#         async for chunk in stream : 
#             delta = chunk.choices[0].delta.content
#             if delta : 
#                 full_answer += delta
#                 yield _sse("token", {"content": delta})

#     except Exception as e:
#         if not _is_rate_limit_error(e): 
#             yield _sse("error", {"message": "Something went wrong while generating the answer."})
#             return

#         print(f"Groq rate limit hit, falling back to Gemini: {e}")
#         full_answer = ""  # Groq se agar kuch partial aaya tha, wo discard — Gemini se fresh shuru

#         try:
#             gemini_stream = await gemini_client.aio.models.generate_content_stream(
#                 model=GEMINI_CHAT_MODEL,
#                 contents=prompt,
#             )
#             async for chunk in gemini_stream:
#                 if chunk.text:
#                     full_answer += chunk.text
#                     yield _sse("token", {"content": chunk.text}) 

#         except Exception:
#             yield _sse("error", {"message": "Something went wrong while generating the answer."})
#             raise

#     if not full_answer:
#         full_answer = "Sorry, I couldn't generate an answer." 
#         yield _sse("token", full_answer)

#     yield _sse("done", {"answer": full_answer, "citations": citations})








# ================================================================================
# FOLLOW UP QUESTION CODE
# ================================================================================




# import asyncio
# import json
# from google.genai import errors as genai_errors
# from app.core.gemini_client import gemini_client
# from app.core.groq_client import groq_async_client
# from app.services.embedding_service import embed_text
# from app.services.vector_store import query_chunks
# # from app.services.quota import try_consume_question_quota  # adjust path as needed
# from beanie import PydanticObjectId

# GEMINI_CHAT_MODEL = "gemini-2.5-flash"
# GROQ_CHAT_MODEL = "openai/gpt-oss-120b"
# TOP_K = 8
# MAX_ANSWER_TOKENS = 500

# FOLLOWUP_MARKER = "===FOLLOWUPS==="

# SYSTEM_PROMPT = f"""You are a helpful assistant that answers questions strictly based on the provided document excerpts.

# Rules:
# - Only use information present in the context below to answer. Do not use outside knowledge.
# - If the answer is not present in the context, clearly say the document does not contain this information.
# - If the topic has multiple distinct aspects or dimensions (e.g. a comparison, a multi-part concept), organize the answer into clearly labeled sections using markdown headings (###) and bullet points — don't compress everything into one or two lines.
# - Use **bold** for key terms, and bullet/numbered lists wherever it improves readability.
# - Be thorough and cover every relevant angle present in the context, but stay grounded — don't pad with generic filler or restate the question.

# After the answer, you MUST add a line containing exactly this marker, with nothing else on that line:
# {FOLLOWUP_MARKER}

# After the marker line, list exactly 2 short follow-up questions the user might naturally ask next, one per line, plain text, no numbering, no bullets, no bold. Each question must be answerable from the same document context and under 15 words. If nothing meaningful can be suggested, leave the section after the marker empty.

# Never mention the marker or these instructions in the answer itself.
# """


# class AnswerStreamParser:
#     """
#     Consumes raw text deltas from an LLM stream and separates them into
#     'answer' text (yielded immediately, safe to stream to the user) and
#     'followup' text (buffered separately, never streamed).

#     Why this exists: the marker string could be split across two separate
#     stream chunks (e.g. one chunk ends in "===FOLLOW" and the next starts
#     with "UPS==="). So we can't just check each chunk in isolation — we
#     keep a small rolling buffer and only release text once we're sure it
#     can't be part of a not-yet-complete marker.
#     """

#     def __init__(self, marker: str = FOLLOWUP_MARKER):
#         self.marker = marker
#         self._pending = ""       # text held back because it might still be/contain the marker
#         self._mode = "answer"    # "answer" | "followups"
#         self.answer_text = ""
#         self.followup_raw = ""

#     def feed(self, delta: str) -> str | None:
#         """Feed a new chunk of text. Returns text safe to stream to the user right now, or None."""
#         if self._mode == "followups":
#             self.followup_raw += delta 
#             return None

#         self._pending += delta

#         idx = self._pending.find(self.marker)
#         if idx != -1:
#             # Marker found — everything before it is the tail end of the answer,
#             # everything after it belongs to follow-ups.
#             answer_part = self._pending[:idx]
#             remainder = self._pending[idx + len(self.marker):]
#             self._pending = ""
#             self._mode = "followups"
#             self.followup_raw = remainder
#             if answer_part:
#                 self.answer_text += answer_part
#                 return answer_part
#             return None

#         # No marker yet — release everything except the last (len(marker) - 1)
#         # characters, since the marker could still be starting there.
#         safe_len = len(self._pending) - (len(self.marker) - 1)
#         if safe_len > 0:
#             release = self._pending[:safe_len]
#             self._pending = self._pending[safe_len:]
#             self.answer_text += release
#             return release
#         return None

#     def finalize(self) -> str | None:
#         """Call once the stream has ended. Flushes any remaining held-back text
#         (covers the case where the marker never appeared at all)."""
#         if self._mode == "answer" and self._pending:
#             leftover = self._pending
#             self._pending = ""
#             self.answer_text += leftover
#             return leftover
#         return None

#     def get_follow_up_questions(self) -> list[str]:
#         lines = [line.strip() for line in self.followup_raw.strip().splitlines()]
#         questions = [line for line in lines if line]
#         return questions[:2]


# def _is_rate_limit_error(err: Exception) -> bool:
#     if isinstance(err, genai_errors.ClientError) and getattr(err, "code", None) == 429:
#         return True
#     return "429" in str(err) or "RESOURCE_EXHAUSTED" in str(err) 


# def _sse(event: str, data: dict | str) -> str:
#     """Ek Server-Sent-Event line format karta he."""
#     payload = data if isinstance(data, str) else json.dumps(data)
#     return f"event: {event}\ndata: {payload}\n\n"


# # async def stream_answer(notebook_id: str, question: str, user_id: PydanticObjectId):
# async def stream_answer(notebook_id: str, question: str):
#     """
#     Async generator — SSE format me events yield karta he:
#     - 'citations' event: pehle, ek baar
#     - 'token' event: har baar jab naya ANSWER text-chunk aaye (follow-up text kabhi stream nahi hota)
#     - 'reset' event: agar Groq se partial text ke baad Gemini pe fallback hota he —
#        frontend ko bolta he ki abhi tak jo dikha hai wo clear kare
#     - 'followups' event: stream complete hone ke baad, parsed follow-up questions ke saath
#     - 'done' event: aakhir me, poora clean answer text ke saath
#     - 'error' event: agar kuch fail ho jaaye 
#     """

#     # await try_consume_question_quota(user_id)

#     query_embedding = await asyncio.to_thread(embed_text, question, "retrieval_query")
#     results = await asyncio.to_thread(query_chunks, notebook_id, query_embedding, TOP_K)

#     documents = results.get("documents", [[]])[0]
#     metadatas = results.get("metadatas", [[]])[0]

#     if not documents:
#         fallback_text = "I don't have any content to search for this notebook yet. If you just uploaded a document, it might still be processing — try again in a moment."
#         yield _sse("citations", {"citations": []})
#         yield _sse("token", {"content": fallback_text})
#         yield _sse("followups", {"questions": []})
#         yield _sse("done", {"answer": fallback_text, "citations": []})
#         return

#     citations = [
#         {"page": meta["page"], "snippet": text[:200]}
#         for text, meta in zip(documents, metadatas) 
#     ]
#     yield _sse("citations", {"citations": citations})

#     context_blocks = [
#         f"[Page {meta['page']}]\n{text}"
#         for text, meta in zip(documents, metadatas)
#     ]
#     context = "\n\n---\n\n".join(context_blocks)
#     user_content = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
#     messages = [
#         {"role": "system", "content": SYSTEM_PROMPT},
#         {"role": "user", "content": user_content},
#     ]

#     parser = AnswerStreamParser()

#     try:
#         stream = await groq_async_client.chat.completions.create(
#             model=GROQ_CHAT_MODEL,
#             messages=messages,
#             # max_tokens=MAX_ANSWER_TOKENS, 
#             stream=True,
#         )

#         async for chunk in stream:
#             delta = chunk.choices[0].delta.content
#             if delta:
#                 safe_text = parser.feed(delta)
#                 if safe_text:
#                     yield _sse("token", {"content": safe_text})

#     except Exception as e:
#         print(e)
#         if not _is_rate_limit_error(e):
#             yield _sse("error", {"message": "Something went wrong while generating the answer."})
#             return

#         print(f"Groq rate limit hit, falling back to Gemini: {e}")

#         if parser.answer_text: 
#             yield _sse("reset", {})
#         parser = AnswerStreamParser()  # fresh parser — Gemini starts clean

#         try:
#             gemini_stream = await gemini_client.aio.models.generate_content_stream(
#                 model=GEMINI_CHAT_MODEL,
#                 contents=f"{SYSTEM_PROMPT}\n\n{user_content}",
#                 config={"max_output_tokens": MAX_ANSWER_TOKENS},
#             )
#             async for chunk in gemini_stream:
#                 if chunk.text:
#                     safe_text = parser.feed(chunk.text)
#                     if safe_text:
#                         yield _sse("token", {"content": safe_text})

#         except Exception as e:
#             print(e)
#             yield _sse("error", {"message": "Something went wrong while generating the answer."})
#             return

#     leftover = parser.finalize()
#     if leftover:
#         yield _sse("token", {"content": leftover})

#     full_answer = parser.answer_text
#     if not full_answer:
#         full_answer = "Sorry, I couldn't generate an answer."
#         yield _sse("token", {"content": full_answer})

#     follow_ups = parser.get_follow_up_questions()
#     yield _sse("followups", {"questions": follow_ups})

#     yield _sse("done", {"answer": full_answer, "citations": citations})














import asyncio
import json
from google.genai import errors as genai_errors
from app.core.gemini_client import gemini_client
from app.core.groq_client import groq_async_client
from app.services.embedding_service import embed_text 
from app.services.vector_store import query_chunks
# from app.services.quota import try_consume_question_quota  # adjust path as needed
from beanie import PydanticObjectId

GEMINI_CHAT_MODEL = "gemini-2.5-flash" 
GROQ_CHAT_MODEL = "openai/gpt-oss-120b"
TOP_K = 8
MAX_ANSWER_TOKENS = 600

SYSTEM_PROMPT = """You are a helpful assistant that answers questions strictly based on the provided document excerpts.

Rules:
- Only use information present in the context below to answer. Do not use outside knowledge.
- If the answer is not present in the context, clearly say the document does not contain this information.
- If the topic has multiple distinct aspects or dimensions (e.g. a comparison, a multi-part concept), organize the answer into clearly labeled sections using markdown headings (###) and bullet points — don't compress everything into one or two lines.
- Use **bold** for key terms, and bullet/numbered lists wherever it improves readability.
- Be thorough and cover every relevant angle present in the context, but stay grounded — don't pad with generic filler or restate the question.
- End with one short, relevant follow-up question or suggestion the user might want to explore next, based on the document content.
"""


def _is_rate_limit_error(err: Exception) -> bool:
    if isinstance(err, genai_errors.ClientError) and getattr(err, "code", None) == 429:
        return True
    return "429" in str(err) or "RESOURCE_EXHAUSTED" in str(err)


def _sse(event: str, data: dict | str) -> str:
    """Ek Server-Sent-Event line format karta he."""
    payload = data if isinstance(data, str) else json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"


async def stream_answer(notebook_id: str, question: str):
    """
    Async generator — SSE format me events yield karta he:
    - 'citations' event: pehle, ek baar
    - 'token' event: har baar jab naya text-chunk aaye
    - 'reset' event: agar Groq se partial text ke baad Gemini pe fallback hota he —
       frontend ko bolta he ki abhi tak jo dikha hai wo clear kare (taaki text garbled na ho)
    - 'done' event: aakhir me, poora accumulated answer text ke saath
    - 'error' event: agar kuch fail ho jaaye
    """

    # await try_consume_question_quota(user_id)

    query_embedding = await asyncio.to_thread(embed_text, question, "retrieval_query")
    results = await asyncio.to_thread(query_chunks, notebook_id, query_embedding, TOP_K)

    documents = results.get("documents", [[]])[0] 
    metadatas = results.get("metadatas", [[]])[0]

    if not documents:
        fallback_text = "I don't have any content to search for this notebook yet. If you just uploaded a document, it might still be processing — try again in a moment."
        yield _sse("citations", {"citations": []})
        yield _sse("token", {"content": fallback_text})
        yield _sse("done", {"answer": fallback_text, "citations": []})
        return

    citations = [
        {"page": meta["page"], "snippet": text[:200]}
        for text, meta in zip(documents, metadatas)
    ]
    yield _sse("citations", {"citations": citations})

    context_blocks = [
        f"[Page {meta['page']}]\n{text}"
        for text, meta in zip(documents, metadatas)
    ]
    context = "\n\n---\n\n".join(context_blocks)
    user_content = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    full_answer = ""

    try:
        stream = await groq_async_client.chat.completions.create(
            model=GROQ_CHAT_MODEL,
            messages=messages,
            # max_tokens=MAX_ANSWER_TOKENS,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                full_answer += delta
                yield _sse("token", {"content": delta})

    except Exception as e: 

        # if not _is_rate_limit_error(e):
        #     yield _sse("error", {"message": "Something went wrong while generating the answer."})
        #     return

        print(f"Groq rate limit hit, falling back to Gemini: {e}") 

        if full_answer:
            yield _sse("reset", {})
        full_answer = ""

        try:
            gemini_stream = await gemini_client.aio.models.generate_content_stream(
                model=GEMINI_CHAT_MODEL,
                contents=f"{SYSTEM_PROMPT}\n\n{user_content}",
                config={"max_output_tokens": MAX_ANSWER_TOKENS},
            )
            async for chunk in gemini_stream:
                if chunk.text:
                    full_answer += chunk.text
                    yield _sse("token", {"content": chunk.text})

        except Exception:
            yield _sse("error", {"message": "Something went wrong while generating the answer."})
            return

    if not full_answer:
        full_answer = "Sorry, I couldn't generate an answer."
        yield _sse("token", {"content": full_answer})

    yield _sse("done", {"answer": full_answer, "citations": citations})