
const LINE_BREAK = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/g;


export function getLineRanges(text) {
    const ranges = [];
    let start = 0;
    for (const match of text.matchAll(LINE_BREAK)) {
        ranges.push([start, match.index]);
        start = match.index + match[0].length;
    }
    if (start < text.length) ranges.push([start, text.length]);
    return ranges;
}