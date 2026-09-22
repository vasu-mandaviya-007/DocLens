from app.core.config import settings


def chunk_page_text(page_num : int, text : str, chunk_size : int = settings.CHUNK_SIZE, overlap : int =settings.CHUNK_OVERLAP) : 
    words = text.split()
    chunks = []

    start = 0

    while start < len(words) :  
        end = start + chunk_size
        chunk_text = " ".join(words[start:end])
        chunks.append({"text" : chunk_text, "page" : page_num})  
        start += chunk_size - overlap

    return chunks


def chunk_pages(pages : list[dict]) -> list[dict] : 

    all_chunks = []

    for p in pages : 
        if not p["text"].strip() : 
            continue

        all_chunks.extend(chunk_page_text(p["page"], p["text"]))

    return all_chunks




