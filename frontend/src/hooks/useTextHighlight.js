
import { useCallback, useEffect } from "react";

const HIGHLIGHT_NAME = "citation-highlight";

export const HIGHLIGHT_CSS = `::highlight(${HIGHLIGHT_NAME}) { background-color: #2874e0; color: inherit; }`;


const PREFIX_WORDS = [30, 15, 8, 5];
const SUFFIX_WORDS = [15, 8, 5];

export function supportsHighlights() {
    return typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";
}


export function normalizeNeedle(text) {
    return text
        .replace(/^\s*(```|~~~)[^\n]*$/gm, " ") 
        .replace(/^\s*[|:\-\s]{3,}$/gm, " ") 
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") 
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") 
        .replace(/^\s{0,3}#{1,6}\s+/gm, " ") 
        .replace(/^\s*[-*+]\s+/gm, " ") 
        .replace(/^\s*\d+[.)]\s+/gm, " ") 
        .replace(/^\s*>\s?/gm, " ") 
        .replace(/\|/g, " ") 
        .replace(/(\*\*|__|~~|`)/g, "") 
        .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, "$1$2") 
        .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?])/g, "$1$2") 
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}


export function buildTextIndex(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
            ["STYLE", "SCRIPT"].includes(node.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });

    const chars = [];
    const nodes = [];
    const offsets = [];
    let lastWasSpace = true;
    let prevNode = null;
    let prevEnd = 0;

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
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
                chars.push(lower.length === 1 ? lower : ch);
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


export function useTextHighlight(containerRef) {

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

            if (supportsHighlights()) CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
            scrollToRange(range);
            return true;
        },

        [containerRef]

    );

}