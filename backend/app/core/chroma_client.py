import chromadb
from app.core.config import settings

# LOCAL
# chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)

# PRODUCTION
chroma_client = chromadb.CloudClient(   
    api_key=settings.CHROMA_API_KEY,
    tenant=settings.CHROMA_TENANT,
    database=settings.CHROMA_DATABASE, 
)

collection = chroma_client.get_or_create_collection(name="notebook_chunks")
