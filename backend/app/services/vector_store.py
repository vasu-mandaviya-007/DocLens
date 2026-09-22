from app.core.chroma_client import collection



def add_chunks_to_store(
    notebook_id : str, 
    document_id : str,
    filename : str,
    chunks : list[dict], 
    embeddings : list[list[float]],
) : 
    ids = [f"{document_id}_{i}" for i in range(len(chunks))] 

    documents = [c["text"] for c in chunks]

    metadatas = [
        {
            "notebook_id" : notebook_id,
            "document_id" : document_id,
            "filename": filename,
            "page": c["page"],
        }
        for c in chunks
    ]

    collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)


def query_chunks(notebook_id : str, query_embedding: list[float], top_k: int = 5) : 
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"notebook_id" : notebook_id}
    )



def delete_chunks_for_notebook(notebook_id: str):
    collection.delete(where={"notebook_id" : notebook_id}) 