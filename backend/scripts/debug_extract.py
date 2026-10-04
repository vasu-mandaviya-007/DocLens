"""
debug_extract.py

Ek single file jo bilkul wahi karti hai jo tumhare project ki
pdf_service.py + chunk_service.py karti hain:

    1) pdfplumber se har page ka text nikalna (+ bullet glyph cleanup)
    2) text ko chunks me todna (line-based chunker, --old se purana word-based)

Kuch bhi DB / embedding / API ko touch nahi karta. Output terminal me
dikhta hai aur ek text file me bhi save hota hai, taaki tum aaram se dekh sako.

Run (project folder me, jahan PDF rakhi hai):
    python debug_extract.py Unit-1.pdf
    python debug_extract.py Unit-1.pdf --size 200 --overlap 30
    python debug_extract.py Unit-1.pdf --pages 1-3
    python debug_extract.py Unit-1.pdf --old        # purana word-based chunker

Install (agar pdfplumber nahi hai):
    pip install pdfplumber
"""

import argparse
import re
import sys
import unicodedata

import pdfplumber

# Windows console pe "•" jaise characters print karte waqt crash na ho
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


# ============================================================================
# 1) PDF EXTRACTION  (pdf_service.py jaisa)
# ============================================================================

# PDF ke bullet symbols private-use unicode hote hain (browser me dibba dikhta hai)
BULLET_RE = re.compile(r"[\uE000-\uF8FF]")


def extract_pages_from_pdf(pdf_path: str) -> list[dict]:
    pages = [] 
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            text = BULLET_RE.sub("•", text)
            pages.append({"page": i, "text": text})
    return pages


# ============================================================================
# 2) CHUNKING  (chunk_service.py jaisa)
# ============================================================================

def _split_long_line(line: str, max_words: int) -> list[str]:
    """Bahut lambi line ho to pehle sentence se, phir bhi lambi ho to words se todo."""
    pieces = []
    for sentence in re.split(r"(?<=[.!?])\s+", line):
        words = sentence.split()
        if len(words) <= max_words:
            pieces.append(sentence)
        else:
            for i in range(0, len(words), max_words):
                pieces.append(" ".join(words[i:i + max_words]))
    return pieces


def chunk_page_text(page_num: int, text: str, chunk_size: int, overlap: int) -> list[dict]:
    """NAYA: poori lines ke boundary pe chunk todta hai, overlap bhi poori lines ka."""
    units = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if len(line.split()) > chunk_size:
            units.extend(_split_long_line(line, chunk_size))
        else:
            units.append(line)

    chunks = []
    current: list[str] = []
    current_words = 0

    for unit in units:
        n = len(unit.split())

        if current and current_words + n > chunk_size:
            chunks.append({"text": "\n".join(current), "page": page_num})

            carry, carry_words = [], 0
            for prev in reversed(current):
                pw = len(prev.split())
                if carry_words + pw > overlap:
                    break
                carry.insert(0, prev)
                carry_words += pw
            current, current_words = carry, carry_words

        current.append(unit)
        current_words += n

    if current:
        chunks.append({"text": "\n".join(current), "page": page_num})

    return chunks


def chunk_page_text_old(page_num: int, text: str, chunk_size: int, overlap: int) -> list[dict]:
    """PURANA: sirf words gin ke katta hai (newlines mita deta hai). Comparison ke liye."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append({"text": " ".join(words[start:end]), "page": page_num})
        start += chunk_size - overlap
    return chunks


def chunk_pages(pages: list[dict], chunk_size: int, overlap: int, use_old: bool) -> list[dict]:
    fn = chunk_page_text_old if use_old else chunk_page_text
    all_chunks = []
    for p in pages:
        if not p["text"].strip():
            continue
        all_chunks.extend(fn(p["page"], p["text"], chunk_size, overlap))
    return all_chunks


# ============================================================================
# Debug helpers
# ============================================================================

def parse_page_range(spec: str | None, total: int) -> set[int]:
    if not spec:
        return set(range(1, total + 1))
    selected: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            selected.update(range(int(a), int(b) + 1))
        elif part:
            selected.add(int(part))
    return selected


def find_suspicious_chars(text: str) -> dict[str, int]:
    """Aise characters jo browser me dibba (▯) ya kachra dikha sakte hain."""
    found: dict[str, int] = {}
    for ch in text:
        if ch in "\n\t":
            continue
        cat = unicodedata.category(ch)
        if cat in ("Co", "Cn", "Cs", "Cc") or ch == "\ufffd":
            key = f"U+{ord(ch):04X}"
            found[key] = found.get(key, 0) + 1
    return found


def main():
    parser = argparse.ArgumentParser(description="Debug PDF extraction + chunking")
    parser.add_argument("pdf", help="PDF file ka path (e.g. Unit-1.pdf)")
    parser.add_argument("--size", type=int, default=200, help="CHUNK_SIZE (words), default 200")
    parser.add_argument("--overlap", type=int, default=30, help="CHUNK_OVERLAP (words), default 30")
    parser.add_argument("--pages", default=None, help='sirf ye pages dekho, e.g. "1-3" ya "2,5,7"')
    parser.add_argument("--old", action="store_true", help="purana word-based chunker use karo")
    parser.add_argument("--out", default="extracted_debug.txt", help="output file ka naam")
    args = parser.parse_args()

    out_lines: list[str] = []

    def emit(line: str = ""):
        print(line)
        out_lines.append(line)

    pages = extract_pages_from_pdf(args.pdf)
    selected = parse_page_range(args.pages, len(pages))

    pages_to_show = [p for p in pages if p["page"] in selected]
    chunks = chunk_pages(pages_to_show, args.size, args.overlap, args.old)

    bar = "=" * 80
    thin = "-" * 80

    emit(bar)
    emit("SUMMARY")
    emit(bar)
    emit(f"File            : {args.pdf}")
    emit(f"Total pages     : {len(pages)}  (dikha rahe hain: {len(pages_to_show)})")
    emit(f"Chunker         : {'OLD (word-based)' if args.old else 'NEW (line-based)'}")
    emit(f"CHUNK_SIZE      : {args.size} words")
    emit(f"CHUNK_OVERLAP   : {args.overlap} words")
    emit(f"Total chunks    : {len(chunks)}")
    empty_pages = [p["page"] for p in pages_to_show if not p["text"].strip()]
    if empty_pages:
        emit(f"Khaali pages    : {empty_pages}  (scanned image ho sakte hain)")

    # ---- Part A: har page ka raw extracted text ----
    emit()
    emit(bar)
    emit("PART A: PAGE-WISE EXTRACTED TEXT  (pdf_service ka output)")
    emit(bar)
    for p in pages_to_show:
        words = len(p["text"].split())
        emit()
        emit(f"### PAGE {p['page']}   ({words} words, {p['text'].count(chr(10)) + 1} lines)")
        emit(thin)
        emit(p["text"] if p["text"].strip() else "[KHAALI - koi text nahi mila]")

        bad = find_suspicious_chars(p["text"])
        if bad:
            emit(thin)
            emit(f"!! Suspicious characters (dibbe/kachra): {bad}")

    # ---- Part B: chunks ----
    emit()
    emit(bar)
    emit("PART B: CHUNKS  (chunk_service ka output, ye hi embedding me jayenge)")
    emit(bar)
    for idx, c in enumerate(chunks):
        n_words = len(c["text"].split())
        n_lines = c["text"].count("\n") + 1
        first_line = c["text"].split("\n", 1)[0]
        emit()
        emit(f"### CHUNK {idx}   page={c['page']}   words={n_words}   lines={n_lines}")
        emit(thin)
        emit(c["text"])
        emit(thin)
        emit(f"(pehli line: {first_line[:80]!r})")

    # ---- Quick stats ----
    if chunks:
        sizes = [len(c["text"].split()) for c in chunks]
        emit()
        emit(bar)
        emit("CHUNK SIZE STATS (words)")
        emit(bar)
        emit(f"min={min(sizes)}   max={max(sizes)}   avg={sum(sizes) // len(sizes)}")
        too_small = sum(1 for s in sizes if s < 20)
        if too_small:
            emit(f"Bahut chhote chunks (<20 words): {too_small}")

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))

    print(f"\n[OK] Poora output '{args.out}' me bhi save ho gaya.")


if __name__ == "__main__":
    main()