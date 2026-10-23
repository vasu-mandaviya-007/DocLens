
import logging

from app.services.documents.pdf_service import extract_pages_from_pdf_bytes, InvalidPdfError

logger = logging.getLogger(__name__)

try : 
    import magic
except : 
    magic = None


class UnsupportedFileTypeError(Exception):
    """Raised when detect_file_type() can't map the upload to a supported type."""


class InvalidDocumentError(Exception):
    """Generic 'file is corrupt/unreadable': format koi bhi ho, upload route ko sirf yahi ek exception pakadni hai."""


_CONTENT_TYPE_MAP = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "text/markdown": "md",
    "text/x-markdown": "md",
}

_CODE_EXTENSIONS = (
    "py", "js", "jsx", "ts", "tsx", "java", "c", "cpp", "h", "hpp", "cs", "go", "rs", "rb", "php",
    "kt", "swift", "sql", "sh", "html", "css", "json", "yaml", "yml", "xml", "toml", "ini", "csv",
)

_EXTENSION_MAP = {
    "pdf": "pdf",
    "docx": "docx",
    "txt": "txt",
    "md": "md",
    **dict.fromkeys(_CODE_EXTENSIONS, "txt"),
}


_FALLBACK_SIGNATURES = {
    "pdf": (b"%PDF-",),
    "docx": (b"PK\x03\x04",),
}

_EXPECTED_MIME = {
    "pdf": "application/pdf",
    "docx": "application/zip",  
}

SUPPORTED_FILE_LABEL = "PDF, Word (.docx), Markdown (.md), text (.txt), or code files (.py, .js, .java, .cpp, ...)"


def detect_file_type(filename: str, content_type: str | None) -> str | None:
    if content_type:
        mime = content_type.split(";", 1)[0].strip().lower()
        if mime in _CONTENT_TYPE_MAP:
            return _CONTENT_TYPE_MAP[mime]

    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        return _EXTENSION_MAP.get(ext)

    return None


def _verify_signature(file_bytes: bytes, file_type: str) -> None:
    if file_type in ("txt", "md"):
        return

    if magic is not None:
        detected_mime = magic.from_buffer(file_bytes, mime=True)
        expected_mime = _EXPECTED_MIME.get(file_type)
        if expected_mime and detected_mime not in (
            expected_mime,
            "application/x-zip-compressed",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ):
            raise InvalidDocumentError(
                "This file's content doesn't match its extension. Please upload a valid file."
            )
        return

    signatures = _FALLBACK_SIGNATURES.get(file_type)
    if not signatures:
        return
    if not any(file_bytes.startswith(sig) for sig in signatures):
        raise InvalidDocumentError(
            "This file's content doesn't match its extension. Please upload a valid file."
        )


def extract_pages(file_bytes: bytes, file_type: str, max_pages: int | None = None) -> list[dict]:

    _verify_signature(file_bytes, file_type) 

    if file_type == "pdf":
        try:
            return extract_pages_from_pdf_bytes(file_bytes, max_pages)
        except InvalidPdfError as e:
            raise InvalidDocumentError(str(e)) from e

    if file_type == "docx":
        from app.services.documents.docx_service import extract_pages_from_docx_bytes
        return extract_pages_from_docx_bytes(file_bytes)

    if file_type in ("txt", "md"):
        from app.services.documents.txt_service import extract_pages_from_txt_bytes
        return extract_pages_from_txt_bytes(file_bytes)

    raise UnsupportedFileTypeError(f"Unsupported file type: {file_type}")













