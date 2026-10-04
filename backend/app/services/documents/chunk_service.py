# from app.core.config import settings


# def chunk_page_text(page_num : int, text : str, chunk_size : int = settings.CHUNK_SIZE, overlap : int =settings.CHUNK_OVERLAP) :
#     words = text.split()
#     chunks = []

#     start = 0

#     while start < len(words) :
#         end = start + chunk_size
#         chunk_text = " ".join(words[start:end])
#         chunks.append({"text" : chunk_text, "page" : page_num})
#         start += chunk_size - overlap

#     return chunks


# def chunk_pages(pages : list[dict]) -> list[dict] :

#     all_chunks = []

#     for p in pages :
#         if not p["text"].strip() :
#             continue

#         all_chunks.extend(chunk_page_text(p["page"], p["text"]))

#     return all_chunks









# =======================================================================================
# LINE WISE CHINKING
# =======================================================================================




# import re
# from app.core.config import settings


# def _split_long_line(line: str, max_words: int) -> list[str]:
#     pieces = []
#     for sentence in re.split(r"(?<=[.!?])\s+", line):
#         words = sentence.split()
#         if len(words) <= max_words:
#             pieces.append(sentence)
#         else:
#             for i in range(0, len(words), max_words):
#                 pieces.append(" ".join(words[i : i + max_words]))
#     return pieces


# def chunk_page_text(
#     page_num: int,
#     text: str,
#     chunk_size: int = settings.CHUNK_SIZE,
#     overlap: int = settings.CHUNK_OVERLAP,
# ):
#     units = []
#     for line in text.split("\n"):
#         line = line.strip()
#         if not line:
#             continue
#         if len(line.split()) > chunk_size:
#             units.extend(_split_long_line(line, chunk_size))
#         else:
#             units.append(line)

#     chunks = []
#     current: list[str] = []
#     current_words = 0

#     for unit in units:
#         n = len(unit.split())

#         if current and current_words + n > chunk_size:
#             chunks.append({"text": "\n".join(current), "page": page_num})

#             carry, carry_words = [], 0
#             for prev in reversed(current):
#                 pw = len(prev.split())
#                 if carry_words + pw > overlap:
#                     break
#                 carry.insert(0, prev)
#                 carry_words += pw
#             current, current_words = carry, carry_words

#         current.append(unit)
#         current_words += n

#     if current:
#         chunks.append({"text": "\n".join(current), "page": page_num})

#     return chunks


# def chunk_pages(pages: list[dict]) -> list[dict]:
#     all_chunks = []
#     for p in pages:
#         if not p["text"].strip():
#             continue
#         all_chunks.extend(chunk_page_text(p["page"], p["text"]))
#     return all_chunks








# =======================================================================================
# SMART SEMANTIC CHINKING USING LUNGCHAIN 
# =======================================================================================



# from app.core.config import settings
# from langchain_text_splitters import RecursiveCharacterTextSplitter

# def chunk_pages(pages: list[dict]) -> list[dict]:
#     # LangChain ka smart splitter jo Markdown structure ki respect karta hai
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=settings.CHUNK_SIZE,
#         chunk_overlap=settings.CHUNK_OVERLAP,
#         # Ye separators list bohot important hai. Ye isi order me text ko todne ki koshish karega.
#         separators=[
#             "\n# ",    # Heading 1
#             "\n## ",   # Heading 2
#             "\n### ",  # Heading 3
#             "\n\n",    # Paragraph break
#             "\n",      # Line break
#             ". ",      # Sentence break
#             " ",       # Word break
#             ""
#         ]
#     ) 

#     all_chunks = []
    
#     for p in pages:
#         text = p["text"].strip()
#         if not text:
#             continue
            
#         # Is page ke markdown text ko smart chunks me tod do
#         page_chunks = text_splitter.split_text(text)
        
#         for chunk_text in page_chunks:
#             all_chunks.append({
#                 "text": chunk_text,
#                 "page": p["page"]  # Original page number assign kar rahe hain
#             })
            
#     return all_chunks

















# =======================================================================================
# CHANGES IN OTHER FILE TYPES
# =======================================================================================




"""app/services/documents/chunk_service.py"""

from bisect import bisect_left, bisect_right

from langchain_text_splitters import Language, RecursiveCharacterTextSplitter

from app.core.config import settings

# Extension -> LangChain Language ka naam. Language-aware splitter code ko class/function ki
# boundary pe todta hai, kisi bhi jagah nahi. getattr isliye ki purane langchain version me sab languages nahi hoti.
_LANGUAGE_BY_EXTENSION = {
    "py": "PYTHON", "js": "JS", "jsx": "JS", "ts": "TS", "tsx": "TS",
    "java": "JAVA", "c": "C", "h": "C", "cpp": "CPP", "hpp": "CPP", "cs": "CSHARP",
    "go": "GO", "rs": "RUST", "rb": "RUBY", "php": "PHP", "kt": "KOTLIN",
    "swift": "SWIFT", "html": "HTML",
}

# Language-aware splitter nahi, par markdown bhi nahi: plain text ya data files
_PLAIN_TEXT_EXTENSIONS = {"txt", "sql", "sh", "css", "json", "yaml", "yml", "xml", "toml", "ini", "csv"}

_PLAIN_SEPARATORS = ["\n\n", "\n", " ", ""]

# PDF (pymupdf4llm), DOCX (headings Markdown me) aur .md ke liye: heading, paragraph, line, sentence, word
_MARKDOWN_SEPARATORS = ["\n# ", "\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""]


def _make_splitter(filename: str) -> RecursiveCharacterTextSplitter:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    common = {
        "chunk_size": settings.CHUNK_SIZE,
        "chunk_overlap": settings.CHUNK_OVERLAP,
        "add_start_index": True,  # chunk poori file me kahan se shuru hota hai (line number nikalne ke liye)
    }

    language = getattr(Language, _LANGUAGE_BY_EXTENSION.get(ext, ""), None)
    if language is not None:
        return RecursiveCharacterTextSplitter.from_language(language, **common)
    if ext in _PLAIN_TEXT_EXTENSIONS:
        return RecursiveCharacterTextSplitter(separators=_PLAIN_SEPARATORS, **common)
    return RecursiveCharacterTextSplitter(separators=_MARKDOWN_SEPARATORS, **common)


def _chunk_by_pages(pages: list[dict], splitter: RecursiveCharacterTextSplitter) -> list[dict]:
    """PDF/DOCX: asli ya approximate page hota hai, har page alag kaato aur page number lagao."""
    chunks = []
    for p in pages:
        text = p["text"].strip()
        if not text:
            continue
        for chunk_text in splitter.split_text(text):
            chunks.append({"text": chunk_text, "page": p["page"]})
    return chunks


def _chunk_by_lines(pages: list[dict], splitter: RecursiveCharacterTextSplitter) -> list[dict]:
    """txt/md/code: extractor 50-line ke windows deta hai, par windows ki seema pe function kat jata.
    Isliye pehle poori file jodte hain, ek saath kaatte hain, aur har chunk ki exact line range nikalte hain."""
    # Windows contiguous hote hain (sirf poori-khali windows skip hoti hain), line number se wapas jodo
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
        if start_index < 0:  # splitter ne position nahi di (rare): lines ke bina, sirf text
            chunks.append({"text": doc.page_content, "page": pages[0]["page"]})
            continue

        start_line = bisect_left(newline_at, start_index) + 1  # start_index se pehle kitni newlines
        page = pages[max(bisect_right(page_starts, start_line) - 1, 0)]["page"]
        chunks.append(
            {
                "text": doc.page_content,
                "page": page,  # sirf approximate chunk number: asli pehchaan start_line/end_line hai
                "start_line": start_line,
                "end_line": start_line + doc.page_content.count("\n"),
            }
        )
    return chunks


def chunk_pages(pages: list[dict], filename: str = "") -> list[dict]:
    """pages: extractor ka output. filename se pata chalta hai kaun sa splitter lagana hai.
    Return: [{"text", "page"}, ...]; txt/md/code chunks me start_line/end_line bhi."""
    if not pages:
        return []

    splitter = _make_splitter(filename)
    if "start_line" in pages[0]:
        return _chunk_by_lines(pages, splitter)
    return _chunk_by_pages(pages, splitter)








