from app.services.documents.document_extractor import InvalidDocumentError
import codecs


TXT_LINES_PER_PAGE = 50
BINARY_SNIFF_BYTES = 8192


def _decode(file_bytes : bytes) -> str : 
    if file_bytes.startswith((codecs.BOM_UTF16_LE, codecs.BOM_UTF32_BE)) : 
        return file_bytes.decode("utf-16", errors="replace")

    if b"\x00" in file_bytes[:BINARY_SNIFF_BYTES] : 
        raise InvalidDocumentError("This file looks like a binary file, not text.")

    try : 
        return file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError : 
        return file_bytes.decode("latin-1")


def _line_ranges(lines : list[str], max_lines : int) ->  list[tuple[int, int]] : 
    ranges : list[tuple[int, int]] = []
    min_lines = max_lines * 3 // 4
    start  = 0

    while start < len(lines) : 
        end = min(start + max_lines, len(lines))
        if end < len(lines) : 
            for cut in range(end, start + min_lines, -1) : 
                if not lines[cut-1].strip() : 
                    end = cut
                    break
        ranges.append((start, end))
        start = end
    return ranges



def extract_pages_from_txt_bytes(file_bytes: bytes) -> list[dict]: 
    

    lines = _decode(file_bytes).splitlines()

    if not any(line.strip() for line in lines):
        raise InvalidDocumentError("This text file is empty.")

    pages: list[dict] = []
    for start, end in _line_ranges(lines, TXT_LINES_PER_PAGE):
        text = "\n".join(lines[start:end])
        if not text.strip() : 
            continue
        pages.append({"page": len(pages) + 1, "text": text, "start_line": start + 1, "end_line": end})

    return pages