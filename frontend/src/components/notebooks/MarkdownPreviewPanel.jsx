// import { useEffect, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { FileText, Loader2 } from "lucide-react";
// import remarkGfm from "remark-gfm";

// export default function MarkdownPreviewPanel({ documentUrl }) {
//     const [markdown, setMarkdown] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);

//     useEffect(() => {
//         if (!documentUrl) return;

//         let cancelled = false;
//         setLoading(true);
//         setError(false);

//         fetch(documentUrl)
//             .then((res) => {
//                 if (!res.ok) throw new Error("Could not fetch document");
//                 return res.text();
//             })
//             .then((body) => {
//                 if (!cancelled) setMarkdown(body);
//             })
//             .catch(() => {
//                 if (!cancelled) setError(true);
//             })
//             .finally(() => {
//                 if (!cancelled) setLoading(false);
//             });

//         return () => {
//             cancelled = true;
//         };
//     }, [documentUrl]);

//     if (loading) {
//         return (
//             <div className="h-full flex items-center justify-center">
//                 <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
//             </div>
//         );
//     }

//     if (error || markdown === null) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
//                 <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
//                 <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
//             </div>
//         );
//     }

//     return (
//         <div className="h-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed overflow-y-auto px-6 py-5">
//             <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
//         </div>
//     );
// }












import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { HIGHLIGHT_CSS, useTextHighlight } from "../../hooks/useTextHighlight.js";
import { getLineRanges } from "../../utils/lineRanges.js";

const MarkdownPreviewPanel = forwardRef(function MarkdownPreviewPanel({ documentUrl, onReady }, ref) {
    const [markdown, setMarkdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const contentRef = useRef(null);
    const highlight = useTextHighlight(contentRef);
    const lineRanges = useMemo(() => (markdown == null ? [] : getLineRanges(markdown)), [markdown]);

    useImperativeHandle(
        ref,
        () => ({
            jumpToPage: () => { }, // markdown me page nahi hota

            // .md ke citations me backend start_line/end_line deta hai. Rendered page me line numbers nahi hote,
            // isliye un lines ka raw markdown nikalte hain aur uska text rendered page me dhoondhte hain.
            highlightLines: (startLine, endLine) => {
                const first = lineRanges[startLine - 1];
                const last = lineRanges[Math.min(endLine, lineRanges.length) - 1];
                if (!first || !last) return;
                highlight(markdown.slice(first[0], last[1]));
            },

            highlightText: highlight,
        }),
        [highlight, lineRanges, markdown]
    );

    useEffect(() => {
        if (!documentUrl) return;

        let cancelled = false;
        setLoading(true);
        setError(false);

        fetch(documentUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Could not fetch document");
                return res.text();
            })
            .then((body) => {
                if (!cancelled) setMarkdown(body);
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

    // Load ho gaya (ya fail): sidebar ko batao, taaki wo ruka hua citation-jump ab chala sake
    useEffect(() => {
        if (!loading) onReady?.();
    }, [loading, onReady]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
            </div>
        );
    }

    if (error || markdown === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
                <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
                <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
            </div>
        );
    }

    return (
        <div className="h-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed overflow-y-auto px-6 py-5">
            <style>{HIGHLIGHT_CSS}</style>
            <div ref={contentRef}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
        </div>
    );
});

export default MarkdownPreviewPanel;