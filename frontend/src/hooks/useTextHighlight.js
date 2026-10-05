// src/hooks/useTextHighlight.js
//
// Rendered content (DOCX ka mammoth HTML, Markdown ka HTML) me citation ka text dhoondhke highlight karta hai.
// Text DOM me alag dikhta hai (headings me "#" nahi, table me "|" nahi, bullets me "-" nahi) jabki chunk ka text
// backend ne markdown-jaisa banaya tha: isliye pehle chunk ka text normalize hota hai, phir match.
// Rang CSS Custom Highlight API se: DOM badalta nahi, to dangerouslySetInnerHTML ke content me bhi safe hai.
import { useCallback, useEffect } from "react";

const HIGHLIGHT_NAME = "citation-highlight";

// ::highlight() me sirf background/color jaisi limited properties chalti hain
// export const HIGHLIGHT_CSS = `::highlight(${HIGHLIGHT_NAME}) { background-color: color-mix(in oklab, var(--color-brand-primary) /* #2874f0 */ 60%, transparent);; color: inherit; }`;
export const HIGHLIGHT_CSS = `::highlight(${HIGHLIGHT_NAME}) { background-color: #2874e0; color: inherit; }`;

// Pura chunk na mile (formatting ka farak) to uske pehle N words dhoondho, phir aakhri N words se end tay karo
const PREFIX_WORDS = [30, 15, 8, 5];
const SUFFIX_WORDS = [15, 8, 5];

export function supportsHighlights() {
    return typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";
}

/** Chunk ka markdown-jaisa text -> wahi text jaisa rendered page me dikhta hai (lowercase, single spaces). */
export function normalizeNeedle(text) {
    return text
        .replace(/^\s*(```|~~~)[^\n]*$/gm, " ") //                 code fence lines
        .replace(/^\s*[|:\-\s]{3,}$/gm, " ") //                    table separator / horizontal rule (| --- | --- |)
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") //                  images: page me text nahi
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") //                links: sirf link ka text dikhta hai
        .replace(/^\s{0,3}#{1,6}\s+/gm, " ") //                    headings
        .replace(/^\s*[-*+]\s+/gm, " ") //                         bullets
        .replace(/^\s*\d+[.)]\s+/gm, " ") //                       numbered list
        .replace(/^\s*>\s?/gm, " ") //                             blockquote
        .replace(/\|/g, " ") //                                    table cells
        .replace(/(\*\*|__|~~|`)/g, "") //                         bold / strike / code markers
        .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, "$1$2") // *italic*
        .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?])/g, "$1$2") //   _italic_ (snake_case_name ko nahi chhedta)
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

/** Container ke saare text nodes ko ek normalized string me jodta hai, aur har character ka (node, offset) yaad rakhta hai. */
export function buildTextIndex(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
            ["STYLE", "SCRIPT"].includes(node.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });

    const chars = [];
    const nodes = [];
    const offsets = [];
    let lastWasSpace = true; // shuru me space nahi
    let prevNode = null;
    let prevEnd = 0;

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        // Alag text nodes (paragraphs, table cells) ke beech ek space: "end of p1" + "start of p2" ek word na ban jayein
        if (!lastWasSpace && prevNode) {
            chars.push(" ");
            nodes.push(prevNode);
            offsets.push(prevEnd);
            lastWasSpace = true;
        }

        const data = node.data;
        for (let i = 0; i < data.length; i++) {
            const ch = data[i];
            if (/\s/.test(ch)) {
                if (!lastWasSpace) {
                    chars.push(" ");
                    nodes.push(node);
                    offsets.push(i);
                    lastWasSpace = true;
                }
            } else {
                const lower = ch.toLowerCase();
                chars.push(lower.length === 1 ? lower : ch); // kuch letters lowercase me 2 chars ban jate hain: index na bigde
                nodes.push(node);
                offsets.push(i);
                lastWasSpace = false;
            }
        }
        prevNode = node;
        prevEnd = data.length;
    }

    return { text: chars.join(""), nodes, offsets };
}

/** Chunk ka text index me dhoondho. Mila to DOM Range, nahi to null. */
export function findRange(index, rawText) {
    const needle = normalizeNeedle(rawText);
    if (!needle) return null;

    const words = needle.split(" ");
    const prefixSizes = [...new Set([words.length, ...PREFIX_WORDS].map((n) => Math.min(n, words.length)))].sort((a, b) => b - a);

    let start = -1;
    let end = -1;
    let usedWords = 0;
    for (const size of prefixSizes) {
        const phrase = words.slice(0, size).join(" ");
        const at = index.text.indexOf(phrase);
        if (at !== -1) {
            start = at;
            end = at + phrase.length;
            usedWords = size;
            break;
        }
    }
    if (start === -1) return null;

    // Sirf shuruwat mili: chunk ka aakhri hissa bhi dhoondho taaki poora passage highlight ho (zyada door ho to chhod do)
    if (usedWords < words.length) {
        for (const size of SUFFIX_WORDS) {
            if (size > words.length - usedWords) continue; // prefix se overlap na ho
            const phrase = words.slice(-size).join(" ");
            const at = index.text.indexOf(phrase, end);
            if (at !== -1 && at + phrase.length - start <= needle.length * 1.5 + 50) {
                end = at + phrase.length;
                break;
            }
        }
    }

    const endNode = index.nodes[end - 1];
    const range = document.createRange();
    range.setStart(index.nodes[start], index.offsets[start]);
    range.setEnd(endNode, Math.min(index.offsets[end - 1] + 1, endNode.length));
    return range;
}

export function clearHighlight() {
    if (supportsHighlights()) CSS.highlights.delete(HIGHLIGHT_NAME);
}

function scrollToRange(range) {
    const container = range.startContainer;
    const el = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

/**
 * containerRef: rendered content ka element.
 * Return: highlight(text) -> true agar text mila. Na mile to purana highlight hat jata hai.
 */
export function useTextHighlight(containerRef) {
    // Panel band hote hi highlight hatao: CSS.highlights page-wide hai, panel ke saath khud nahi jata
    useEffect(() => clearHighlight, []);

    return useCallback(
        (text) => {
            const root = containerRef.current;
            if (!root || !text) return false;

            const range = findRange(buildTextIndex(root), text);
            if (!range) {
                clearHighlight(); 
                return false;
            }

            // Highlight API na ho (purane browsers): rang nahi, par us jagah tak scroll phir bhi hoga
            if (supportsHighlights()) CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
            scrollToRange(range);
            return true;
        },
        [containerRef]
    );
}