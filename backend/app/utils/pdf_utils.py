import io
import pdfplumber


class InvalidPdfError(Exception):
    pass


def get_pdf_page_count(file_bytes: bytes) -> int:
    """
    PDF bytes (already in memory) se page count nikalta hai.
    Disk pe likhne/dubara padhne ki zaroorat nahi — jo bytes upload
    validate karte waqt already read kiye the, wahi reuse hote hain.
    """
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf: 
            return len(pdf.pages)
    except Exception:
        raise InvalidPdfError("Could not read this PDF — it may be corrupted or password-protected")