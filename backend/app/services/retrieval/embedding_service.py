from app.core.gemini_client import gemini_client
from google.genai import types


EMBEDDING_MODEL = "gemini-embedding-2"  
 

def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
    result = gemini_client.models.embed_content(  
        model=EMBEDDING_MODEL, 
        contents=text, 
        config=types.EmbedContentConfig(task_type=task_type) 
    )
    return result.embeddings[0].values
    

def embed_chunks(chunks : list[str]) -> list[float] :   
    return [embed_text(chunk) for chunk in chunks]  






# ==========================================================================================================
# SMART EMBEDDING - EMBED IN BATCH
# ==========================================================================================================



# import logging
# import time

# from google.genai import types

# from app.core.gemini_client import gemini_client

# logger = logging.getLogger(__name__)

# EMBEDDING_MODEL = "gemini-embedding-2"

# # Gemini ek request me itne texts leta hai. Pehle har chunk ke liye alag call hota tha:
# # 500 pages = hazaaron calls, slow, aur rate limit (429) lagne par poora upload fail.
# EMBED_BATCH_SIZE = 100
# EMBED_MAX_RETRIES = 3
# EMBED_RETRY_DELAY_SECONDS = 3
# _RETRYABLE_MARKERS = ("429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE")


# def _embed_batch(texts: list[str], task_type: str) -> list[list[float]]:
#     """Ek request me texts ka batch. Overload/rate-limit pe thoda ruk ke dobara."""
#     for attempt in range(1, EMBED_MAX_RETRIES + 1):
#         try:
#             result = gemini_client.models.embed_content(
#                 model=EMBEDDING_MODEL,
#                 contents=texts,
#                 config=types.EmbedContentConfig(task_type=task_type),
#             )
#             print(len(result.embeddings[0].values))
#             vectors = [e.values for e in result.embeddings]
#             if len(vectors) != len(texts):
#                 # Chunk aur vector ka order/count mismatch hua to galat chunk ko galat vector milega
#                 raise RuntimeError(f"Embedding count mismatch: sent {len(texts)}, got {len(vectors)}")
#             return vectors

#         except Exception as e:
#             retryable = any(marker in str(e) for marker in _RETRYABLE_MARKERS)
#             if retryable and attempt < EMBED_MAX_RETRIES:
#                 delay = EMBED_RETRY_DELAY_SECONDS * attempt
#                 logger.warning(
#                     "Embedding request throttled (attempt %s/%s), retrying in %ss",
#                     attempt, EMBED_MAX_RETRIES, delay,
#                 )
#                 time.sleep(delay)  # ye function asyncio.to_thread me chalta hai, event loop block nahi hota
#                 continue
#             raise


# def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
#     """Ek text (jaise user ka sawal: task_type="retrieval_query")."""
#     return _embed_batch([text], task_type)[0]


# def embed_chunks(chunks: list[str]) -> list[list[float]]:
#     """Saare chunks ke vectors, wahi order me. 100-100 ke batch me bhejta hai."""
#     print(len(chunks))
#     vectors: list[list[float]] = []
#     for start in range(0, len(chunks), EMBED_BATCH_SIZE):
#         vectors.extend(_embed_batch(chunks[start : start + EMBED_BATCH_SIZE], "retrieval_document"))
#     return vectors

















# ==========================================================================================================
# USING OLAMA MODEL FOR EMBEDDING
# ==========================================================================================================



# from langchain_ollama import OllamaEmbeddings
 

# EMBEDDING_MODEL = "gemini-embedding-2"  

# embedder = OllamaEmbeddings(model="mxbai-embed-large")

# def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
#     return embedder.embed_query(text) 
    

# def embed_chunks(chunks : list[str]) -> list[list[float]]:   
#     return embedder.embed_documents(chunks) 




