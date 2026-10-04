import chromadb
from app.core.config import settings

# chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)


import chromadb

chroma_client = chromadb.CloudClient( 
    api_key="ck-EWHwgETRT9rF3EwU6GDWBpk9jFSs4rSX4f5h5GyVfA7y",
    tenant="ec16b864-a206-4889-b8a0-474590927cb3",
    database="docLens",
)


collection = chroma_client.get_or_create_collection(name="notebook_chunks")
