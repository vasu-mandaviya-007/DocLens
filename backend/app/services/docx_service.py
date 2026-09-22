import io
import logging

import docx  # hard dependency: DOCX is a core supported file type (see SUPPORTED_FILE_LABEL),
             # so a missing package should fail at import time / requirements install,
             # not silently disable a feature at runtime.

from app.services.document_extractor import InvalidDocumentError

logger = logging.getLogger(__name__)

# Chunk size for pseudo-pagination — NOT a real Word page boundary.
# Kept as "page" in the returned dict shape for compatibility with the PDF
# extractor's output, but callers/UI should treat this as an approximate
# chunk index, not a literal page number.
DOCX_WORDS_PER_PAGE = 400


def extract_pages_from_docx_bytes(file_bytes: bytes) -> list[dict]:
    try:
        document = docx.Document(io.BytesIO(file_bytes))
    except Exception as e:
        logger.warning("Failed to parse DOCX file", exc_info=True)
        raise InvalidDocumentError("Could not read this Word document — it may be corrupted.") from e

    pages: list[dict] = []
    current_words: list[str] = []
    page_num = 1

    def flush_page():
        nonlocal page_num
        if current_words:
            pages.append({"page": page_num, "text": " ".join(current_words)})
            page_num += 1
            current_words.clear()

    for para in document.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        current_words.extend(text.split())
        if len(current_words) >= DOCX_WORDS_PER_PAGE:
            flush_page()

    flush_page()

    if not pages:
        raise InvalidDocumentError("This Word document has no readable text.")

    return pages