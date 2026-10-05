// import { useEffect, useState } from "react";
// import mammoth from "mammoth";
// import { FileText, Loader2 } from "lucide-react";

// export default function DocxPreviewPanel({ documentUrl }) {
//     const [html, setHtml] = useState(null); 
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
//                 return res.arrayBuffer();
//             })
//             .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
//             .then((result) => {
//                 if (!cancelled) setHtml(result.value);
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

//     if (error || !html) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
//                 <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
//                 <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
//                 {documentUrl && (
//                     <a
//                         href={documentUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-xs text-primary hover:underline"
//                     >
//                         Download instead 
//                     </a>
//                 )}
//             </div>
//         );
//     }

//     // NOTE: dangerouslySetInnerHTML yahan use kiya hai kyunki mammoth raw HTML
//     // deta hai. Ye document khud user ne apne notebook ke liye upload kiya
//     // hai (sirf unhi ko dikhta hai, kisi aur ko share nahi hota), isliye risk
//     // same-origin/self-uploaded-content jaisa hi hai — normal document
//     // preview features mein ye common pattern hai.
//     return (
//         <div className="h-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 overflow-y-auto px-6 py-5  ">
//             <div className="docx-preview" dangerouslySetInnerHTML={{ __html: html }} />
//         </div>
//     );
// }





















import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import mammoth from "mammoth";
import { FileText, Loader2 } from "lucide-react";
import { HIGHLIGHT_CSS, useTextHighlight } from "../../hooks/useTextHighlight.js";

const DocxPreviewPanel = forwardRef(function DocxPreviewPanel({ documentUrl, onReady }, ref) {
    const [html, setHtml] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const contentRef = useRef(null);
    const highlight = useTextHighlight(contentRef);

    useImperativeHandle(
        ref,
        () => ({
            // PDF viewer ka interface match karne ke liye: Word me asli page nahi hota (backend ke "pages" approximate hain)
            jumpToPage: () => { },
            // Citation ka text rendered page me dhoondhke highlight + scroll
            highlightText: highlight,
        }),
        [highlight]
    );

    useEffect(() => {
        if (!documentUrl) return;

        let cancelled = false;
        setLoading(true);
        setError(false);

        fetch(documentUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Could not fetch document");
                return res.arrayBuffer();
            })
            .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
            .then((result) => {
                if (!cancelled) setHtml(result.value);
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

    if (error || !html) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
                <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
                <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
                {documentUrl && (
                    <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        Download instead
                    </a>
                )}
            </div>
        );
    }

    // NOTE: dangerouslySetInnerHTML yahan use kiya hai kyunki mammoth raw HTML deta hai. Ye document khud user ne
    // apne notebook ke liye upload kiya hai (sirf unhi ko dikhta hai), isliye risk self-uploaded content jaisa hi hai.
    return (
        <div className="h-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 overflow-y-auto px-6 py-5">
            <style>{HIGHLIGHT_CSS}</style>
            <div ref={contentRef} className="docx-preview" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
});

export default DocxPreviewPanel;