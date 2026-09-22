# import pdfplumber
# import io


# class InvalidPdfError(Exception):
#     pass


# def extract_pages_from_pdf_bytes(file_bytes : bytes) -> list[dict] :

#     try :

#         pages = []

#         with pdfplumber.open(io.BytesIO(file_bytes)) as pdf :
#             for i, page in enumerate(pdf.pages, start=1) :
#                 text = page.extract_text() or ""
#                 pages.append({"page" : i, "text" : text})

#         return pages

#     except Exception:
#         raise InvalidPdfError("Could not read this PDF — it may be corrupted or password-protected")


import io
import logging

import pdfplumber

logger = logging.getLogger(__name__)


class InvalidPdfError(Exception):
    pass


def extract_pages_from_pdf_bytes(file_bytes: bytes) -> list[dict]:
    try:
        pages = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                pages.append({"page": i, "text": text})
        return pages

    except Exception as e:
        logger.warning("Failed to parse PDF file", exc_info=True)
        raise InvalidPdfError(
            "Could not read this PDF — it may be corrupted or password-protected"
        ) from e
