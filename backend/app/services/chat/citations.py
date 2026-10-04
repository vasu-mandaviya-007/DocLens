"""app/services/citations.py — citation format ka single source of truth (backend side).

Format: [S1], [S1][S3]. Model kabhi [S1, S3] likhe to normalize ho jata hai.
`[S\\d+]` normal text/code me almost kabhi nahi aata, isliye arr[1] ya
bibliography ke [1] se collision nahi hota.
"""

import re

_NUM_RE = re.compile(r"\d+")
_FENCED_CODE_RE = re.compile(r"```.*?```", re.DOTALL)

CITATION_RE = re.compile(r"[\[【]S(\d+(?:\s*,\s*S?\d+)*)(?:†[^\]】]*)?[\]】]")

SOURCE_LINE_RE = re.compile(
    r"^[ \t>*_\"“]*(?:sources?|references?)\s*:\s*(?:[\[【]S\d+[\]】][\s,;]*)+[\"”*_]*[ \t]*$",
    re.IGNORECASE | re.MULTILINE,
)

def normalize_citations(text: str) -> str:
    """[S1, S3] -> [S1][S3]"""
    return CITATION_RE.sub(
        lambda m: "".join(f"[S{n}]" for n in _NUM_RE.findall(m.group(1))), text
    )


def strip_citations(text: str) -> str:
    """Chat history me purane answers ke markers hata do (wo purane turn ke sources ke the)."""
    return re.sub(r"[ \t]*" + CITATION_RE.pattern, "", text)


def _strip_in_code_blocks(text: str) -> str:
    return _FENCED_CODE_RE.sub(lambda m: strip_citations(m.group(0)), text)


def extract_used_ids(text: str, valid_ids: set[int]) -> list[int]:
    used: list[int] = []
    for m in CITATION_RE.finditer(text):
        for n in map(int, _NUM_RE.findall(m.group(1))):
            if n in valid_ids and n not in used:
                used.append(n)
    return used


def finalize_answer(text: str) -> str:
    """Stream khatam hone ke baad ek hi jagah sab cleanup."""
    text = normalize_citations(text)
    text = _strip_in_code_blocks(text)
    text = SOURCE_LINE_RE.sub("", text)
    return text.rstrip()