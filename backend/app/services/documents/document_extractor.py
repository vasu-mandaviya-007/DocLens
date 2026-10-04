# import io

# from app.services.pdf_service import extract_pages_from_pdf_bytes, InvalidPdfError

# try : 
#     import docx
# except ImportError :  
#     docx = None


# class UnsupportedFileTypeError(Exception):
#     """Jab file ka type support hi nahi karte (detect_file_type None de)."""
#     pass
 
 
# class InvalidDocumentError(Exception):
#     """Generic 'file corrupt/unreadable hai' — format chahe koi bhi ho,
#     upload_document route isi ek exception ko catch karega."""
#     pass
 

# _CONTENT_TYPE_MAP = {
#     "application/pdf": "pdf",
#     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
#     "text/plain": "txt",
# }

# _EXTENSION_MAP = {
#     "pdf": "pdf",
#     "docx": "docx",
#     "txt": "txt",
# }

# SUPPORTED_FILE_LABEL = "PDF, Word (.docx), or text (.txt)"

# def detect_file_type(filename : str, content_type : str | None) -> str | None : 
#     if content_type in _CONTENT_TYPE_MAP : 
#         return _CONTENT_TYPE_MAP[content_type]

#     if filename and "." in filename : 
#         ext = filename.split(".",1)[-1].lower()
#         return _EXTENSION_MAP.get(ext)

#     return None

# DOCX_WORDS_PER_PAGE = 400


# def _extract_docx(file_bytes : bytes) -> list[dict] : 
#     if docx is None : 
#         raise InvalidDocumentError(
#             "DOCX is not supported"
#         )

#     try : 
#         document = docx.Document(io.BytesIO(file_bytes))
#     except Exception : 
#         raise InvalidDocumentError("Could not read this Word document — it may be corrupted.")

#     pages : list[dict] = []
#     current_words: list[str] = []
#     page_num = 1

#     def flush_page():
#         nonlocal page_num
#         if current_words:
#             pages.append({"page": page_num, "text": " ".join(current_words)})
#             page_num += 1
#             current_words.clear()

#     for para in document.paragraphs:
#         text = para.text.strip()
#         if not text:
#             continue
#         current_words.extend(text.split())   # <- ye "extend" hona chahiye, "append" nahi
#         if len(current_words) >= DOCX_WORDS_PER_PAGE:
#             flush_page()

#     flush_page()

#     if not pages:
#         raise InvalidDocumentError("This Word document has no readable text.")
 
#     return pages




# # ── TXT ───────────────────────────────────────────────────────────────
# TXT_LINES_PER_PAGE = 50
 
 
# def _extract_txt(file_bytes: bytes) -> list[dict]:
#     try:
#         text = file_bytes.decode("utf-8")
#     except UnicodeDecodeError:
#         try:
#             text = file_bytes.decode("latin-1")
#         except Exception:
#             raise InvalidDocumentError("Could not read this text file — unsupported encoding.")
 
#     lines = text.splitlines()
#     if not any(line.strip() for line in lines):
#         raise InvalidDocumentError("This text file is empty.")
 
#     pages: list[dict] = []
#     for i in range(0, len(lines), TXT_LINES_PER_PAGE):
#         chunk = "\n".join(lines[i : i + TXT_LINES_PER_PAGE])
#         pages.append({"page": i // TXT_LINES_PER_PAGE + 1, "text": chunk})
 
#     return pages



# def extract_pages(file_bytes: bytes, file_type: str) -> list[dict]:
#     """file_type: detect_file_type() se aaya "pdf" / "docx" / "txt".
#     Return shape hamesha same: [{"page": n, "text": "..."}, ...]"""
 
#     if file_type == "pdf":
#         try:
#             return extract_pages_from_pdf_bytes(file_bytes) 
#         except InvalidPdfError as e:
#             raise InvalidDocumentError(str(e))
#     elif file_type == "docx":
#         return _extract_docx(file_bytes)
#     elif file_type == "txt":
#         return _extract_txt(file_bytes)
 
#     raise UnsupportedFileTypeError(f"Unsupported file type: {file_type}")































# import logging

# from app.services.pdf_service import extract_pages_from_pdf_bytes, InvalidPdfError

# logger = logging.getLogger(__name__)

# # Optional defense-in-depth: verify the file's actual signature instead of
# # trusting client-supplied extension/content-type (both are spoofable).
# # Kept optional (not a hard dependency) since it only adds a second layer on
# # top of the extractors, which already reject malformed content on their own.
# try:
#     import magic  # python-magic
# except ImportError:
#     magic = None
#     logger.warning("python-magic not installed — skipping file-signature verification")


# class UnsupportedFileTypeError(Exception):
#     """Raised when detect_file_type() can't map the upload to a supported type."""
#     pass


# class InvalidDocumentError(Exception):
#     """Generic 'file is corrupt/unreadable' — regardless of format, the upload
#     route only needs to catch this one exception."""
#     pass


# _CONTENT_TYPE_MAP = {
#     "application/pdf": "pdf",
#     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
#     "text/plain": "txt",
# }

# _EXTENSION_MAP = {
#     "pdf": "pdf",
#     "docx": "docx",
#     "txt": "txt",
# }

# # Real magic-byte signatures for the formats we accept. DOCX/XLSX/PPTX are all
# # ZIP containers, so this only confirms "it's a ZIP" — good enough to catch a
# # renamed .exe or .pdf, not to distinguish docx from other Office formats.
# _MAGIC_SIGNATURES = {
#     "pdf": (b"%PDF-",),
#     "docx": (b"PK\x03\x04",),
# }

# SUPPORTED_FILE_LABEL = "PDF, Word (.docx), or text (.txt)"


# def detect_file_type(filename: str, content_type: str | None) -> str | None:
#     if content_type in _CONTENT_TYPE_MAP:
#         return _CONTENT_TYPE_MAP[content_type]

#     if filename and "." in filename:
#         ext = filename.split(".", 1)[-1].lower()
#         return _EXTENSION_MAP.get(ext)

#     return None


# def _verify_signature(file_bytes: bytes, file_type: str) -> None:
#     """Best-effort signature check. txt has no reliable magic number, so it's
#     skipped. Raises InvalidDocumentError on a clear mismatch."""
#     if file_type == "txt":
#         return
#     signatures = _MAGIC_SIGNATURES.get(file_type)
#     if not signatures:
#         return
#     if not any(file_bytes.startswith(sig) for sig in signatures):
#         raise InvalidDocumentError(
#             "This file's content doesn't match its extension. Please upload a valid file."
#         )


# def extract_pages(file_bytes: bytes, file_type: str) -> list[dict]:
#     """file_type: output of detect_file_type() — "pdf" / "docx" / "txt".
#     Return shape is always the same: [{"page": n, "text": "..."}, ...]"""

#     _verify_signature(file_bytes, file_type)

#     if file_type == "pdf":
#         try:
#             return extract_pages_from_pdf_bytes(file_bytes)
#         except InvalidPdfError as e:
#             raise InvalidDocumentError(str(e)) from e

#     elif file_type == "docx":
#         from app.services.docx_service import extract_pages_from_docx_bytes
#         return extract_pages_from_docx_bytes(file_bytes)

#     elif file_type == "txt":
#         from app.services.txt_service import extract_pages_from_txt_bytes
#         return extract_pages_from_txt_bytes(file_bytes)

#     raise UnsupportedFileTypeError(f"Unsupported file type: {file_type}")





















# import logging

# from app.services.documents.pdf_service import extract_pages_from_pdf_bytes, InvalidPdfError

# logger = logging.getLogger(__name__) 

# # Optional defense-in-depth: verify the file's actual signature instead of
# # trusting client-supplied extension/content-type (both are spoofable).
# # Kept optional (not a hard dependency) since it only adds a second layer on
# # top of the extractors, which already reject malformed content on their own.
# try:
#     import magic  # python-magic
# except ImportError:
#     magic = None
#     logger.warning("python-magic not installed — skipping file-signature verification")


# class UnsupportedFileTypeError(Exception):
#     """Raised when detect_file_type() can't map the upload to a supported type."""
#     pass


# class InvalidDocumentError(Exception):
#     """Generic 'file is corrupt/unreadable' — regardless of format, the upload
#     route only needs to catch this one exception."""
#     pass


# # _CONTENT_TYPE_MAP = {
# #     "application/pdf": "pdf",
# #     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
# #     "text/plain": "txt",
# # }

# # _EXTENSION_MAP = {
# #     "pdf": "pdf",
# #     "docx": "docx",
# #     "txt": "txt",
# # }


# _CONTENT_TYPE_MAP = {
#     "application/pdf": "pdf",
#     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
#     "text/plain": "txt",
#     "text/markdown": "md",
#     "text/x-markdown": "md",
# }

# _EXTENSION_MAP = {
#     "pdf": "pdf",
#     "docx": "docx",
#     "txt": "txt",
#     "md": "md",
# }


# # Fallback byte signatures, used only if python-magic isn't installed.
# # DOCX/XLSX/PPTX are all ZIP containers, so this only confirms "it's a ZIP" —
# # good enough to catch a renamed .exe or .pdf, not to distinguish docx from
# # other Office formats. python-magic (below) is more precise since it reads
# # actual libmagic mime detection rather than a fixed prefix table.
# _FALLBACK_SIGNATURES = {
#     "pdf": (b"%PDF-",),
#     "docx": (b"PK\x03\x04",),
# }

# # Expected mime type per file_type, as reported by python-magic.
# _EXPECTED_MIME = {
#     "pdf": "application/pdf",
#     "docx": "application/zip",  # libmagic reports docx as generic zip/openxml
# }


# # SUPPORTED_FILE_LABEL = "PDF, Word (.docx), or text (.txt)"
# SUPPORTED_FILE_LABEL = "PDF, Word (.docx), text (.txt), or Markdown (.md)"


# def detect_file_type(filename: str, content_type: str | None) -> str | None:
#     if content_type in _CONTENT_TYPE_MAP:
#         return _CONTENT_TYPE_MAP[content_type]

#     if filename and "." in filename:
#         # ext = filename.split(".", 1)[-1].lower()
#         ext = filename.rsplit(".", 1)[-1].lower()
#         return _EXTENSION_MAP.get(ext)

#     return None


# def _verify_signature(file_bytes: bytes, file_type: str) -> None:
#     """Best-effort signature check against the file's real bytes, not the
#     client-supplied extension/content-type. txt has no reliable magic number,
#     so it's skipped. Raises InvalidDocumentError on a clear mismatch."""
#     # if file_type == "txt":
#     #     return
#     if file_type in ("txt", "md"):
#         return

#     if magic is not None:
#         detected_mime = magic.from_buffer(file_bytes, mime=True)
#         expected_mime = _EXPECTED_MIME.get(file_type)
#         # openxml docs are zip containers; libmagic sometimes reports the
#         # more specific openxml mime type instead of plain zip — accept both.
#         if expected_mime and detected_mime not in (
#             expected_mime,
#             "application/x-zip-compressed",
#             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
#         ):
#             raise InvalidDocumentError(
#                 "This file's content doesn't match its extension. Please upload a valid file."
#             )
#         return

#     # python-magic not installed — fall back to a plain prefix check.
#     signatures = _FALLBACK_SIGNATURES.get(file_type)
#     if not signatures:
#         return
#     if not any(file_bytes.startswith(sig) for sig in signatures):
#         raise InvalidDocumentError(
#             "This file's content doesn't match its extension. Please upload a valid file."
#         )


# def extract_pages(file_bytes: bytes, file_type: str) -> list[dict]:
#     """file_type: output of detect_file_type() — "pdf" / "docx" / "txt".
#     Return shape is always the same: [{"page": n, "text": "..."}, ...]"""

#     _verify_signature(file_bytes, file_type)

#     if file_type == "pdf": 
#         try:
#             return extract_pages_from_pdf_bytes(file_bytes) 
#         except InvalidPdfError as e:
#             raise InvalidDocumentError(str(e)) from e

#     elif file_type == "docx":
#         from app.services.documents.docx_service import extract_pages_from_docx_bytes
#         return extract_pages_from_docx_bytes(file_bytes)

#     elif file_type in ("txt", "md"):
#         from app.services.documents.txt_service import extract_pages_from_txt_bytes
#         return extract_pages_from_txt_bytes(file_bytes)

#     raise UnsupportedFileTypeError(f"Unsupported file type: {file_type}")















"""app/services/documents/document_extractor.py"""

import logging

from app.services.documents.pdf_service import extract_pages_from_pdf_bytes, InvalidPdfError

logger = logging.getLogger(__name__)

try : 
    import magic  # python-magic
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

# Code aur data files bhi plain text hi hain: "txt" extractor se chalte hain, to DB me file_type
# aur upload route me kuch badalna nahi padta. Line numbers se citation "Lines 10-60" ban jati hai.
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

# Fallback byte signatures, sirf jab python-magic installed na ho.
# DOCX bhi ZIP container hai, to ye sirf "ZIP hai" confirm karta hai: renamed .exe ya .pdf pakadne ke liye kaafi hai.
_FALLBACK_SIGNATURES = {
    "pdf": (b"%PDF-",),
    "docx": (b"PK\x03\x04",),
}

# python-magic ke hisab se har file_type ka expected mime
_EXPECTED_MIME = {
    "pdf": "application/pdf",
    "docx": "application/zip",  # libmagic docx ko generic zip/openxml bolta hai
}

SUPPORTED_FILE_LABEL = "PDF, Word (.docx), Markdown (.md), text (.txt), or code files (.py, .js, .java, .cpp, ...)"


def detect_file_type(filename: str, content_type: str | None) -> str | None:
    # "text/plain; charset=utf-8" jaisa content-type bhi match ho
    if content_type:
        mime = content_type.split(";", 1)[0].strip().lower()
        if mime in _CONTENT_TYPE_MAP:
            return _CONTENT_TYPE_MAP[mime]

    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        return _EXTENSION_MAP.get(ext)

    return None


def _verify_signature(file_bytes: bytes, file_type: str) -> None:
    """File ke asli bytes pe best-effort check. txt/md/code ka koi reliable magic number nahi hota,
    unka binary-check txt_service me hota hai. Saaf mismatch pe InvalidDocumentError."""
    if file_type in ("txt", "md"):
        return

    if magic is not None:
        detected_mime = magic.from_buffer(file_bytes, mime=True)
        expected_mime = _EXPECTED_MIME.get(file_type)
        # openxml docs zip containers hain: libmagic kabhi plain zip, kabhi specific openxml mime bolta hai
        if expected_mime and detected_mime not in (
            expected_mime,
            "application/x-zip-compressed",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ):
            raise InvalidDocumentError(
                "This file's content doesn't match its extension. Please upload a valid file."
            )
        return

    # python-magic nahi hai: simple prefix check
    signatures = _FALLBACK_SIGNATURES.get(file_type)
    if not signatures:
        return
    if not any(file_bytes.startswith(sig) for sig in signatures):
        raise InvalidDocumentError(
            "This file's content doesn't match its extension. Please upload a valid file."
        )


def extract_pages(file_bytes: bytes, file_type: str, max_pages: int | None = None) -> list[dict]:
    """file_type: detect_file_type() ka output ("pdf" / "docx" / "txt" / "md").
    Return: [{"page": n, "text": "..."}, ...]. txt/md/code pages me start_line/end_line bhi hote hain."""

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













