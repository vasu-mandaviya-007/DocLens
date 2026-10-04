import re

_CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
_INLINE_CODE_RE = re.compile(r"`([^`]*)`")
_IMAGE_RE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
_LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
_HEADING_RE = re.compile(r"^#{1,6}\s*", re.MULTILINE)
_BOLD_RE = re.compile(r"(\*\*|__)(?=\S)(.+?)(?<=\S)\1")
_ITALIC_STAR_RE = re.compile(r"(?<![\w*])\*(?=\S)(.+?)(?<=\S)\*(?![\w*])")
_ITALIC_UNDERSCORE_RE = re.compile(r"(?<![\w_])_(?=\S)(.+?)(?<=\S)_(?![\w_])")
_TABLE_SEPARATOR_RE = re.compile(r"^\s*\|?[-:\s|]+\|?\s*$", re.MULTILINE)
_HR_RE = re.compile(r"^\s*([*_])\1{2,}\s*$", re.MULTILINE)
_BLOCKQUOTE_RE = re.compile(r"^>\s*", re.MULTILINE)
_BULLET_MARKER_RE = re.compile(r"^\s*[-*+]\s+", re.MULTILINE)
_WHITESPACE_RE = re.compile(r"\s+")

 
def strip_markdown(text: str) -> str:
    """Markdown chunk ko PDF ke text layer jaisa plain text banata hai (highlight matching ke liye)."""
    text = _CODE_FENCE_RE.sub(" ", text)
    text = _INLINE_CODE_RE.sub(r"\1", text)
    text = _IMAGE_RE.sub(" ", text)
    text = _LINK_RE.sub(r"\1", text)
    text = _HEADING_RE.sub("", text)
    text = _BOLD_RE.sub(r"\2", text)
    text = _ITALIC_STAR_RE.sub(r"\1", text)
    text = _ITALIC_UNDERSCORE_RE.sub(r"\1", text)
    text = _HR_RE.sub(" ", text)
    text = _TABLE_SEPARATOR_RE.sub(" ", text)
    text = text.replace("|", " ")
    text = _BLOCKQUOTE_RE.sub("", text)
    text = _BULLET_MARKER_RE.sub("", text)
    return _WHITESPACE_RE.sub(" ", text).strip()











# def strip_markdown(text: str) -> str:
#     """
#     pymupdf4llm se extracted chunks Markdown-formatted hote hain (#, **, |,
#     list-markers, etc) — jo asli PDF ke plain text-layer (jahan PDFium
#     search karta hai) me kahin exist hi nahi karte. Isi mismatch ki wajah
#     se citation-click-pe-highlight feature fail/galat-match hoti thi. Ye
#     function citation-snippet ko clean plain-text banata hai taaki PDF ke
#     actual content se zyada reliably match ho — aur frontend/DB me bhi
#     hamesha clean text hi dikhe, raw Markdown nahi.
#     """
#     # Code blocks / inline code
#     text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
#     text = re.sub(r"`([^`]*)`", r"\1", text)
#     # Images — content nahi hota, poora hata do
#     text = re.sub(r"!\[.*?\]\(.*?\)", " ", text)
#     # Links — sirf visible text rakho, URL hatao
#     text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
#     # Headings (#, ##, ###...)
#     text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
#     # Bold / italic
#     text = re.sub(r"(\*\*\*|___)(.*?)\1", r"\2", text)
#     text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)
#     text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)
#     # Table separator-rows (|---|---|) aur baaki pipes
#     text = re.sub(r"^\s*\|?[-:\s|]+\|?\s*$", " ", text, flags=re.MULTILINE)
#     text = text.replace("|", " ")
#     # Blockquotes
#     text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
#     # List markers (-, *, +, 1.)
#     text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
#     text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
#     # Horizontal rules
#     text = re.sub(r"^\s*([-*_])\1{2,}\s*$", " ", text, flags=re.MULTILINE)
#     # Whitespace collapse
#     text = re.sub(r"\s+", " ", text).strip()
#     return text



