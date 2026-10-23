
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useMemo } from "react";
import { Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { useTextSelection } from "../../hooks/useTextSelection.js";
import { createPortal } from "react-dom";
import { copyText } from "../../hooks/useCopyToClipboard.js";
import { showToast } from "../common/showToast.jsx";
import { getLineRanges } from "../../utils/lineRanges.js";


const LINE_BREAK = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/g;



const TextPreviewPanel = forwardRef(function TextPreviewPanel({ documentUrl, onReady, onExplain }, ref) {
    
    const [text, setText] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [highlightRange, setHighlightRange] = useState(null);
    const highlightNodeRef = useRef(null);

    const { selection, toolbarRef, onPointerUp, clear } = useTextSelection();

    const lineRanges = useMemo(() => (text == null ? [] : getLineRanges(text)), [text]);

    const handleCopySelection = async () => {
        const ok = await copyText(selection.text);
        showToast(ok ? "Selection copied!" : "Couldn't copy. Check browser permissions", "info")
        clear();
    };

    const handleExplainSelection = () => {
        onExplain?.(selection.text);
        clear();
    };

    useImperativeHandle(
        ref,
        () => ({
            jumpToPage: () => { },

            highlightLines: (startLine, endLine) => {
                if (text == null) return;
                const first = lineRanges[startLine - 1];
                const last = lineRanges[Math.min(endLine, lineRanges.length) - 1];
                if (!first || !last) return;
                setHighlightRange({ start: first[0], end: last[1], trigger: Date.now() });
            },

            highlightText: (searchText) => {

                if (!searchText || text == null) return;

                const words = searchText.trim().split(/\s+/).filter(Boolean);
                
                if (words.length === 0) return;

                const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
                const match = text.match(new RegExp(escaped.join("\\s+"), "i"));

                if (!match) {
                    setHighlightRange(null);
                    return;
                }

                setHighlightRange({ start: match.index, end: match.index + match[0].length, trigger: Date.now() });
            },

        }),

        [text, lineRanges]
    );

    useEffect(() => {
        if (!documentUrl) return;

        let cancelled = false;
        setLoading(true);
        setError(false);
        setHighlightRange(null);

        fetch(documentUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Could not fetch document");
                return res.text();
            })
            .then((body) => {
                if (!cancelled) setText(body);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [documentUrl]);

    useEffect(() => {
        if (!loading) onReady?.();
    }, [loading, onReady]);

    useEffect(() => {
        if (highlightRange && highlightNodeRef.current) {
            highlightNodeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [highlightRange]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
            </div>
        );
    }

    if (error || text === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
                <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
                <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
            </div>
        );
    }

    const content = highlightRange ? (
        <>
            {text.slice(0, highlightRange.start)}
            <mark ref={highlightNodeRef} className="bg-brand-primary/60 text-content-default rounded scroll-mt-24">
                {text.slice(highlightRange.start, highlightRange.end)}
            </mark>
            {text.slice(highlightRange.end)}
        </>
    ) : (
        text
    );

    return (
        <div className="h-full overflow-y-auto px-6 py-5">
            <pre onPointerUp={onPointerUp} className="text-[13px] font-display leading-relaxed text-content-default whitespace-pre-wrap ">
                {content}
            </pre>
            {selection &&
                createPortal(
                    <div
                        ref={toolbarRef}
                        className="fixed z-9999 flex items-center gap-1 border border-content-deemphasized/25 px-1.5 py-1.5 dark:bg-black bg-white rounded-lg shadow-[0_0px_40px_rgba(255,255,255,0.15)]  -translate-x-1/2 -translate-y-full animate-fade-in"
                        style={{ top: selection.y, left: selection.x }}
                    >
                        <button onClick={handleCopySelection} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:hover:bg-zinc-800 hover:bg-zinc-100 text-[13px] font-medium transition-colors cursor-pointer dark:text-white text-zinc-900`}>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                        </button>
                        <div className="w-px h-4 dark:bg-zinc-700 bg-zinc-200 mx-1" />
                        <button onClick={handleExplainSelection} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:hover:bg-zinc-800 hover:bg-zinc-100 text-[13px] font-medium transition-colors cursor-pointer dark:text-brand-primary text-blue-500`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            Explain
                        </button>
                    </div>,
                    document.body
                )
            }
        </div>
    );
});

export default TextPreviewPanel;