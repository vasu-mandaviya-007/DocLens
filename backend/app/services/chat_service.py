import json
import asyncio
from app.core.olama_client import ollama_async_client
from app.core.groq_client import groq_async_client
from app.services.embedding_service import embed_text
from app.services.vector_store import query_chunks

OLLAMA_CHAT_MODEL = "gemma2:2b"  
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



def _sse(event : str, data : dict | str) -> str : 
    payload = data if isinstance(data, str) else json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"
    

async def stream_answer(notebook_id : str, question : str) :  

    query_embedding = await asyncio.to_thread(embed_text, question, "retrieval_query")
    results = await asyncio.to_thread(query_chunks, notebook_id, query_embedding, top_k=8)

    documents = results.get("documents", [[]])[0] 
    metadatas = results.get("metadatas", [[]])[0]

    citations = [
        {"page" : meta["page"], "snippet" : text[:200]}
        for text, meta in zip(documents, metadatas)
    ]

    context_blocks = [
        f"[Page {meta['page']}]\n{text}"  
        for text, meta in zip(documents, metadatas)
    ]


    context = "\n\n---\n\n".join(context_blocks)

    user_content = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"

    messages = [
        {"role" : "system", "content" : SYSTEM_PROMPT},
        {"role" : "user", "content" : user_content}
    ]

    full_answer = ""

    try :
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
        # stream = await ollama_async_client.chat(
        #     model=OLLAMA_CHAT_MODEL,
        #     messages=messages,
        #     stream=True
        # )

        # async for chunk in stream : 
        #     text = chunk.message.content
        #     if text : 
        #         full_answer += text
        #         yield _sse("token", {"content" : text})

    except Exception as e : 
        print("Error",e)

    if not full_answer : 
        full_answer = "Sorry, I couldn't generate an answer."
        yield _sse("token", {"content" : full_answer}) 


    yield _sse("citations", {"citations" : citations})

    yield _sse("done", {"answer": full_answer, "citations": []})
