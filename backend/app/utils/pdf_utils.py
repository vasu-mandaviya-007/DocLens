import io
import pdfplumber


class InvalidPdfError(Exception):
    pass


def get_pdf_page_count(file_bytes: bytes) -> int:
    
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf: 
            return len(pdf.pages)
    except Exception:
        raise InvalidPdfError("Could not read this PDF — it may be corrupted or password-protected")