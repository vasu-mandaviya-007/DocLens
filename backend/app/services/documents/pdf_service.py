
# ====================================================================================================
# USING PDF PLUMBER
# ====================================================================================================


# import io
# import logging

# import pdfplumber

# logger = logging.getLogger(__name__)


# class InvalidPdfError(Exception):
#     pass


# def extract_pages_from_pdf_bytes(file_bytes: bytes) -> list[dict]:
#     try:
#         pages = []
#         with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
#             for i, page in enumerate(pdf.pages, start=1):
#                 text = page.extract_text() or ""
#                 pages.append({"page": i, "text": text})
#         return pages

#     except Exception as e:
#         logger.warning("Failed to parse PDF file", exc_info=True)
#         raise InvalidPdfError(
#             "Could not read this PDF — it may be corrupted or password-protected"
#         ) from e








# ====================================================================================================
# USING PYMUPDF4LLM - COVERT PDF INTO MARKDOWN
# ====================================================================================================


# import io
# import logging
# import fitz  # PyMuPDF
# import pymupdf4llm

# logger = logging.getLogger(__name__) 

# class InvalidPdfError(Exception):
#     pass

# def extract_pages_from_pdf_bytes(file_bytes: bytes) -> list[dict]:

#     try:

#         pages = [] 
        
#         # 1. Bytes se PDF ko memory me load karna
#         doc = fitz.Document(stream=file_bytes, filetype="pdf")
        
#         # 2. pymupdf4llm ka use karke Markdown me convert karna
#         # page_chunks=True se ye hume har page ka data alag-alag dictionary me dega
#         md_pages = pymupdf4llm.to_markdown(doc, page_chunks=True)
        
#         for i, page_data in enumerate(md_pages, start=1):
#             # 'text' key ke andar us page ka proper Markdown format me text hota hai
#             text = page_data.get("text", "").strip()
#             pages.append({"page": i, "text": text})
            
#         return pages

#     except Exception as e:
#         logger.warning("Failed to parse PDF file", exc_info=True)
#         raise InvalidPdfError(
#             "Could not read this PDF — it may be corrupted or password-protected"
#         ) from e








# ====================================================================================================
# BATTER ERROR HANDLING
# ====================================================================================================





import logging

import fitz  # PyMuPDF
import pymupdf4llm

logger = logging.getLogger(__name__)


class InvalidPdfError(Exception): 
    pass


def extract_pages_from_pdf_bytes(file_bytes: bytes, max_pages: int | None = None) -> list[dict]:
    try:
        # `with` doc ko band kar deta hai: bade PDFs ki memory chhootti rehti hai
        with fitz.Document(stream=file_bytes, filetype="pdf") as doc:
            if doc.needs_pass:
                raise InvalidPdfError(
                    "This PDF is password-protected. Remove the password and upload it again."
                )
            # Limit extraction se pehle: 5000 pages ki PDF (20MB ke andar bhi ho sakti hai) pehle poori
            # process hoti thi aur baad me reject. Ab seedha mana.
            if max_pages is not None and doc.page_count > max_pages:
                raise InvalidPdfError(f"This PDF has too many pages (max {max_pages}).")
            # page_chunks=True: har page ka alag Markdown milta hai
            md_pages = pymupdf4llm.to_markdown(doc, page_chunks=True)
    except InvalidPdfError:
        raise
    except Exception as e:
        logger.warning("Failed to parse PDF file", exc_info=True)
        raise InvalidPdfError("Could not read this PDF. It may be corrupted.") from e

    pages = []
    for page_number, page_data in enumerate(md_pages, start=1):
        text = page_data.get("text", "").strip()
        # Khali page (blank ya sirf image) chhod do, par page number asli rehta hai
        if text:
            pages.append({"page": page_number, "text": text})

    # Scanned/image-only PDF: koi text hi nahi. Chup-chaap "success" dikhane se behtar saaf error.
    if not pages:
        raise InvalidPdfError(
            "No selectable text found in this PDF. It may be a scan or images only "
            "(scanned PDFs are not supported yet)."
        )

    return pages



