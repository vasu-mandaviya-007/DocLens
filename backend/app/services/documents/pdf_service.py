
import logging

import fitz
import pymupdf4llm

logger = logging.getLogger(__name__)


class InvalidPdfError(Exception): 
    pass


def extract_pages_from_pdf_bytes(file_bytes: bytes, max_pages: int | None = None) -> list[dict]:

    try:

        with fitz.Document(stream=file_bytes, filetype="pdf") as doc:
            if doc.needs_pass:
                raise InvalidPdfError(
                    "This PDF is password-protected. Remove the password and upload it again."
                )
            
            if max_pages is not None and doc.page_count > max_pages:
                raise InvalidPdfError(f"This PDF has too many pages (max {max_pages}).")
            md_pages = pymupdf4llm.to_markdown(doc, page_chunks=True)

    except InvalidPdfError:
        raise
    except Exception as e:
        logger.warning("Failed to parse PDF file", exc_info=True)
        raise InvalidPdfError("Could not read this PDF. It may be corrupted.") from e

    pages = []

    for page_number, page_data in enumerate(md_pages, start=1):
        text = page_data.get("text", "").strip()
        if text:
            pages.append({"page": page_number, "text": text})

    if not pages:
        raise InvalidPdfError(
            "No selectable text found in this PDF. It may be a scan or images only "
            "(scanned PDFs are not supported yet)."
        )

    return pages



