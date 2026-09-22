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




# USING OLAMA MODEL FOR EMBEDDING

# from app.core.gemini_client import gemini_client 
# from langchain_ollama import OllamaEmbeddings
# from google.genai import types 
 

# EMBEDDING_MODEL = "gemini-embedding-2"  

# embedder = OllamaEmbeddings(model="mxbai-embed-large")

# def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
#     return embedder.embed_query(text) 
    

# def embed_chunks(chunks : list[str]) -> list[list[float]]:   
#     return embedder.embed_documents(chunks) 




