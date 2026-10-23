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



