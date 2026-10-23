from bisect import bisect_left, bisect_right

from langchain_text_splitters import Language, RecursiveCharacterTextSplitter

from app.core.config import settings

_LANGUAGE_BY_EXTENSION = {
    "py": "PYTHON", "js": "JS", "jsx": "JS", "ts": "TS", "tsx": "TS",
    "java": "JAVA", "c": "C", "h": "C", "cpp": "CPP", "hpp": "CPP", "cs": "CSHARP",
    "go": "GO", "rs": "RUST", "rb": "RUBY", "php": "PHP", "kt": "KOTLIN",
    "swift": "SWIFT", "html": "HTML",
}

_PLAIN_TEXT_EXTENSIONS = {"txt", "sql", "sh", "css", "json", "yaml", "yml", "xml", "toml", "ini", "csv"}

_PLAIN_SEPARATORS = ["\n\n", "\n", " ", ""]

_MARKDOWN_SEPARATORS = ["\n# ", "\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""]


def _make_splitter(filename: str) -> RecursiveCharacterTextSplitter:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    common = {
        "chunk_size": settings.CHUNK_SIZE,
        "chunk_overlap": settings.CHUNK_OVERLAP,
        "add_start_index": True,  
    }

    language = getattr(Language, _LANGUAGE_BY_EXTENSION.get(ext, ""), None)
    if language is not None:
        return RecursiveCharacterTextSplitter.from_language(language, **common)
    if ext in _PLAIN_TEXT_EXTENSIONS:
        return RecursiveCharacterTextSplitter(separators=_PLAIN_SEPARATORS, **common)
    return RecursiveCharacterTextSplitter(separators=_MARKDOWN_SEPARATORS, **common)


def _chunk_by_pages(pages: list[dict], splitter: RecursiveCharacterTextSplitter) -> list[dict]:
    
    chunks = []
    for p in pages:
        text = p["text"].strip()
        if not text:
            continue
        for chunk_text in splitter.split_text(text):
            chunks.append({"text": chunk_text, "page": p["page"]})
    return chunks


def _chunk_by_lines(pages: list[dict], splitter: RecursiveCharacterTextSplitter) -> list[dict]:
    
    lines = [""] * max(p["end_line"] for p in pages)
    for p in pages:
        for offset, line in enumerate(p["text"].split("\n")):
            lines[p["start_line"] - 1 + offset] = line
    full_text = "\n".join(lines)

    newline_at = [i for i, ch in enumerate(full_text) if ch == "\n"]
    page_starts = [p["start_line"] for p in pages]

    chunks = []
    for doc in splitter.create_documents([full_text]):
        if not doc.page_content.strip():
            continue

        start_index = doc.metadata.get("start_index", -1)
        if start_index < 0: 
            chunks.append({"text": doc.page_content, "page": pages[0]["page"]})
            continue

        start_line = bisect_left(newline_at, start_index) + 1 
        page = pages[max(bisect_right(page_starts, start_line) - 1, 0)]["page"]
        chunks.append(
            {
                "text": doc.page_content,
                "page": page,  
                "start_line": start_line,
                "end_line": start_line + doc.page_content.count("\n"),
            }
        )
    return chunks


def chunk_pages(pages: list[dict], filename: str = "") -> list[dict]:

    if not pages:
        return []

    splitter = _make_splitter(filename)
    if "start_line" in pages[0]:
        return _chunk_by_lines(pages, splitter)
    return _chunk_by_pages(pages, splitter)








