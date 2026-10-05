// src/utils/lineRanges.js

// Python ke str.splitlines() jaisi line boundaries. Backend ke start_line/end_line isi hisaab se bane hain,
// isliye sirf "\n" pe todne se kuch files me (\r, form feed waghera) line numbers khisak jate.
const LINE_BREAK = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/g;

/** Har line ka [start, end) character offset (line-break khud shamil nahi). */
export function getLineRanges(text) {
    const ranges = [];
    let start = 0;
    for (const match of text.matchAll(LINE_BREAK)) {
        ranges.push([start, match.index]);
        start = match.index + match[0].length;
    }
    if (start < text.length) ranges.push([start, text.length]); // aakhri line bina newline ke
    return ranges;
}