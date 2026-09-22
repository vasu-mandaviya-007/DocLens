from app.services.document_extractor import InvalidDocumentError

# Chunk size for pseudo-pagination — not a real page boundary, see note in docx_service.py.
TXT_LINES_PER_PAGE = 50


def extract_pages_from_txt_bytes(file_bytes: bytes) -> list[dict]:
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = file_bytes.decode("latin-1")
        except Exception as e:
            raise InvalidDocumentError("Could not read this text file — unsupported encoding.") from e

    lines = text.splitlines()
    if not any(line.strip() for line in lines):
        raise InvalidDocumentError("This text file is empty.")

    pages: list[dict] = []
    for i in range(0, len(lines), TXT_LINES_PER_PAGE):
        chunk = "\n".join(lines[i : i + TXT_LINES_PER_PAGE])
        pages.append({"page": i // TXT_LINES_PER_PAGE + 1, "text": chunk})

    return pages