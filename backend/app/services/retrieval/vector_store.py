# from app.core.chroma_client import collection



# def add_chunks_to_store(
#     notebook_id : str, 
#     document_id : str,
#     filename : str,
#     chunks : list[dict], 
#     embeddings : list[list[float]],
# ) : 
#     ids = [f"{document_id}_{i}" for i in range(len(chunks))] 

#     documents = [c["text"] for c in chunks]

#     metadatas = [
#         {
#             "notebook_id" : notebook_id,
#             "document_id" : document_id,
#             "filename": filename,
#             "page": c["page"],
#         }
#         for c in chunks
#     ]

#     collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)


# def query_chunks(notebook_id : str, query_embedding: list[float], top_k: int = 5) : 
#     return collection.query(
#         query_embeddings=[query_embedding],
#         n_results=top_k,
#         where={"notebook_id" : notebook_id}
#     )



# def delete_chunks_for_notebook(notebook_id: str):
#     collection.delete(where={"notebook_id" : notebook_id}) 















import numpy as np

from app.core.chroma_client import collection

ADD_BATCH_SIZE = 1000  
FETCH_MULTIPLIER = 4  
MMR_LAMBDA = 0.6 

_OPTIONAL_META_KEYS = ("page", "start_line", "end_line", "section")


def _build_metadata(
    notebook_id: str, document_id: str, filename: str, chunk: dict, index: int
) -> dict:
    meta = {
        "notebook_id": notebook_id,
        "document_id": document_id,
        "filename": filename,
        "chunk_index": index,
    }
    meta.update({k: chunk[k] for k in _OPTIONAL_META_KEYS if chunk.get(k) is not None})
    return meta


def add_chunks_to_store(
    notebook_id: str,
    document_id: str,
    filename: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    documents = [c["text"] for c in chunks]
    metadatas = [
        _build_metadata(notebook_id, document_id, filename, c, i) for i, c in enumerate(chunks)
    ]

    for start in range(0, len(ids), ADD_BATCH_SIZE):
        end = start + ADD_BATCH_SIZE
        collection.upsert(
            ids=ids[start:end],
            embeddings=embeddings[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end],
        )


def _mmr_select(
    query_embedding, doc_embeddings, k: int, lambda_mult: float = MMR_LAMBDA
) -> list[int]:
    
    q = np.asarray(query_embedding, dtype=float)
    d = np.asarray(doc_embeddings, dtype=float)
    q = q / (np.linalg.norm(q) or 1.0)
    d = d / np.clip(np.linalg.norm(d, axis=1, keepdims=True), 1e-12, None)

    relevance = d @ q  
    pairwise = d @ d.T  

    selected = [int(np.argmax(relevance))]
    candidates = set(range(len(d))) - set(selected)

    while candidates and len(selected) < k:
        best = max(
            candidates,
            key=lambda i: lambda_mult * relevance[i] - (1 - lambda_mult) * pairwise[i, selected].max(),
        )
        selected.append(best)
        candidates.remove(best)

    return selected


def query_chunks(notebook_id: str, query_embedding: list[float], top_k: int = 5) -> dict:
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k * FETCH_MULTIPLIER,
        where={"notebook_id": notebook_id},
        include=["documents", "metadatas", "distances", "embeddings"],
    )

    documents = results["documents"][0]
    if len(documents) <= top_k:
        keep = list(range(len(documents)))  
    else:
        keep = _mmr_select(query_embedding, results["embeddings"][0], top_k)

    return {
        "documents": [[documents[i] for i in keep]],
        "metadatas": [[results["metadatas"][0][i] for i in keep]], 
        "distances": [[results["distances"][0][i] for i in keep]],
    }


def delete_chunks_for_notebook(notebook_id: str) -> None:
    collection.delete(where={"notebook_id": notebook_id})



def delete_chunks_for_document(document_id: str) -> None:
    collection.delete(where={"document_id": document_id})
