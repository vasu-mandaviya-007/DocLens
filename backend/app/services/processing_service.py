from app.models.notebook_file import DocumentFile, FileStatus
from beanie import PydanticObjectId
from app.services.chunk_service import chunk_pages
import asyncio 
from app.services.embedding_service import embed_chunks
from app.services.vector_store import add_chunks_to_store

async def process_document(notebook_id : str, document_id : str, filename : str, pages : list[dict]) : 

    document = await DocumentFile.get(PydanticObjectId(document_id))

    if not document :   
        return

    try : 
        chunks = chunk_pages(pages)     

        if not chunks : 
            document.status = FileStatus.failed
            document.error_message = "No extractable text found in this PDF."
            await document.save() 
            return

        texts = [c["text"] for c in chunks]

        embeddings = await asyncio.to_thread(embed_chunks, texts) 
        await asyncio.to_thread(add_chunks_to_store, notebook_id, document_id, filename, chunks, embeddings)

        document.status = FileStatus.ready
        document.total_chunks = len(chunks)
        await document.save()
        

    except Exception as e : 
        document.status = FileStatus.failed
        document.error_message = str(e)[:500]
        print("Embed Error",e) 
        await document.save()


