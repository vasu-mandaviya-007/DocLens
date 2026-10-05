// import { useEffect, useImperativeHandle, useState } from "react";
// import { FileText, Loader2 } from "lucide-react";

// export default function TextPreviewPanel({ documentUrl }) {
//     const [text, setText] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);

//     // useImperativeHandle(ref, () => ({ 

//     //     highlightText : () => {   
//     //         console.log("yes");             
//     //     }

//     // }))

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
//                 if (!cancelled) setText(body);
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

//     if (error || text === null) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
//                 <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
//                 <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
//             </div>
//         );
//     }

//     return (
//         <pre className="h-full overflow-y-auto px-6 py-5 text-[13px] leading-relaxed text-content-default whitespace-pre-wrap font-sans">
//             {text}
//         </pre>
//     );
// }









// import { useEffect, useImperativeHandle, useState, forwardRef, useRef } from "react";
// import { FileText, Loader2 } from "lucide-react";

// const TextPreviewPanel = forwardRef(function TextPreviewPanel({ documentUrl }, ref) {
//     const [text, setText] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);

//     // FIX 1: Sirf string ke bajaye object use karein, jisme 'trigger' timestamp ho
//     const [highlightData, setHighlightData] = useState({ query: "", trigger: 0 });
//     const markRef = useRef(null);

//     useImperativeHandle(ref, () => ({
//         highlightText: (sourceText) => {
//             if (sourceText) {
//                 // FIX 2: Date.now() ensures ki har click naya mana jaye (chahe same text ho)
//                 setHighlightData({ query: sourceText, trigger: Date.now() });
//             }
//         }
//     }));

//     // FIX 3: Scroll logic ko thoda delay dein aur highlightData pe depend karein
//     useEffect(() => {
//         if (highlightData.query && markRef.current) {
//             // Thoda timeout zaroori hai taaki DOM me <mark> pehle ache se render ho jaye
//             setTimeout(() => {
//                 markRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
//             }, 100);
//         }
//     }, [highlightData]); // Ab har click pe ye chalega

//     // Fetch File Logic
//     useEffect(() => {
//         if (!documentUrl) return;

//         let cancelled = false;
//         setLoading(true);
//         setError(false);
//         setHighlightData({ query: "", trigger: 0 }); // File change ho toh reset

//         fetch(documentUrl)
//             .then((res) => {
//                 if (!res.ok) throw new Error("Could not fetch document");
//                 return res.text();
//             })
//             .then((body) => {
//                 if (!cancelled) setText(body);
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

//     // FIX 4: highlightData.query use karein render karne ke liye
//     const renderText = () => {
//         if (!highlightData.query || !text) return text;

//         try {
//             const words = highlightData.query.trim().split(/\s+/).filter(Boolean);
//             if (words.length === 0) return text;

//             const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
//             const regexPattern = `(${escapedWords.join('\\s+')})`;
//             const regex = new RegExp(regexPattern, 'i');

//             const parts = text.split(regex);

//             return parts.map((part, index) => {
//                 if (regex.test(part)) {
//                     return (
//                         <mark
//                             key={index}
//                             ref={markRef}
//                             className="bg-primary/20 text-primary dark:text-primary-400 rounded-sm font-medium py-0.5 transition-colors"
//                         >
//                             {part}
//                         </mark>
//                     );
//                 }
//                 return part;
//             });

//         } catch (err) {
//             console.error("Highlight error:", err);
//             return text;
//         }
//     };

//     if (loading) {
//         return (
//             <div className="h-full flex items-center justify-center">
//                 <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
//             </div>
//         );
//     }

//     if (error || text === null) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
//                 <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
//                 <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
//             </div>
//         );
//     }

//     return (
//         <pre className="h-full overflow-y-auto px-6 py-5 text-[13px] leading-relaxed text-content-default whitespace-pre-wrap font-sans wrap-break-word">
//             {renderText()}
//         </pre>
//     );
// });

// export default TextPreviewPanel;














// import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
// import { Copy, FileText, Loader2, Sparkles } from "lucide-react";
// import { useTextSelection } from "../../hooks/useTextSelection.js";
// import { createPortal } from "react-dom";
// import { copyText } from "../../hooks/useCopyToClipboard.js";
// import appToast from "../common/AppToast.jsx";
// import { showToast } from "../common/showToast.jsx";

// const TOOLBAR_BTN = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:hover:bg-zinc-800 hover:bg-zinc-100 text-[13px] font-medium transition-colors cursor-pointer";


// const TextPreviewPanel = forwardRef(function TextPreviewPanel({ documentUrl, onExplain }, ref) {

//     const [text, setText] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);

//     // Highlight-target: { start, end } character-offsets within `text`.
//     // null hone pe koi highlight nahi dikhta.
//     const [highlightRange, setHighlightRange] = useState(null);
//     const highlightNodeRef = useRef(null);

//     const { selection, toolbarRef, onPointerUp, clear } = useTextSelection();

//     const handleCopySelection = async () => {
//         const ok = await copyText(selection.text); 
//         // appToast.info(ok ? "Selection copied!" : "Couldn't copy. Check browser permissions");
//         showToast(ok ? "Selection copied!" : "Couldn't copy. Check browser permissions", "info")
//         clear();
//     };

//     const handleExplainSelection = () => {
//         onExplain?.(selection.text);
//         clear();
//     };

//     useImperativeHandle(ref, () => ({
//         // PDF-wale viewer ka interface match karne ke liye jumpToPage bhi
//         // expose kiya hai — plain-text me "page" ka concept nahi hai,
//         // isliye ye no-op hai. Isse caller-code (NotebookSidebar) ko kisi
//         // conditional-check ki zaroorat nahi padti ki preview-type kya hai.
//         jumpToPage: () => { },

//         // highlightText: (searchText) => {
//         //     if (!searchText || text == null) return;

//         //     const needle = searchText.trim();
//         //     if (!needle) return;

//         //     // Case-insensitive substring-search text ke andar.
//         //     const haystackLower = text.toLowerCase().trim();
//         //     const needleLower = needle.toLowerCase();
//         //     const start = haystackLower.indexOf(needleLower);

//         //     console.log(needleLower);
//         //     console.log(haystackLower);


//         //     if (start === -1) {
//         //         // Exact match nahi mila — silently ignore, jaisa PDF ke
//         //         // highlightText me bhi karte hain jab search-result na mile.
//         //         setHighlightRange(null);
//         //         return;
//         //     }

//         //     setHighlightRange({ start, end: start + needle.length });
//         // },


//         highlightText: (searchText) => {
//             if (!searchText || text == null) return;

//             const needle = searchText.trim();
//             if (!needle) return;

//             // 1. Text ko words mein tod lein
//             const words = needle.split(/\s+/).filter(Boolean);
//             if (words.length === 0) return;

//             // 2. Har word ko escape karein aur beech mein \s+ lagayein 
//             // (taaki newline, tab, double space sab handle ho jaye)
//             const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
//             const regexPattern = escapedWords.join('\\s+');
//             const regex = new RegExp(regexPattern, 'i'); // 'i' for case-insensitive

//             // 3. Raw text par regex chala kar exact match dhoondhein
//             const match = text.match(regex);

//             if (!match) {
//                 // Exact match nahi mila — silently ignore
//                 setHighlightRange(null);
//                 return;
//             }

//             // 4. Match ka exact start aur end index nikal lein
//             const start = match.index;
//             const end = start + match[0].length;

//             // trigger add kar diya hai taaki har baar scroll/click kaam kare
//             setHighlightRange({ start, end, trigger: Date.now() });
//         }
//     }), [text]);


//     useEffect(() => {
//         if (!documentUrl) return;

//         let cancelled = false;
//         setLoading(true);
//         setError(false);
//         setHighlightRange(null);

//         fetch(documentUrl)
//             .then((res) => {
//                 if (!res.ok) throw new Error("Could not fetch document");
//                 return res.text();
//             })
//             .then((body) => {
//                 if (!cancelled) setText(body);
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

//     // Jab bhi naya highlight-range set ho, us span tak scroll karo.
//     useEffect(() => {
//         if (highlightRange && highlightNodeRef.current) {
//             highlightNodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
//         }
//     }, [highlightRange]);

//     if (loading) {
//         return (
//             <div className="h-full flex items-center justify-center">
//                 <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
//             </div>
//         );
//     }

//     if (error || text === null) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
//                 <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
//                 <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
//             </div>
//         );
//     }

//     // Highlight-range ke hisaab se text ko teen parts me todte hain:
//     // pehle wala plain hissa, highlighted hissa, baaki plain hissa.
//     // Range na ho to poora text as-is render hota hai.
//     const content = highlightRange
//         ? (
//             <>
//                 {text.slice(0, highlightRange.start)} 
//                 <mark
//                     ref={highlightNodeRef}
//                     className="bg-brand-primary/60 text-content-default rounded"
//                 >
//                     {text.slice(highlightRange.start, highlightRange.end)} 
//                 </mark>
//                 {text.slice(highlightRange.end)}   
//             </>
//         )
//         : text;

//     return (
//         <div className="h-full overflow-y-auto px-6 py-5">
//             <pre onPointerUp={onPointerUp} className="text-[13px] font-display leading-relaxed text-content-default whitespace-pre-wrap ">
//                 {content}
//             </pre>
//             {selection &&
//                 createPortal(
//                     <div
//                         ref={toolbarRef} 
//                         className="fixed z-9999 flex items-center gap-1 border border-content-deemphasized/25 px-1.5 py-1.5 dark:bg-black bg-white rounded-lg shadow-[0_0px_40px_rgba(255,255,255,0.15)]  -translate-x-1/2 -translate-y-full animate-fade-in"
//                         style={{ top: selection.y, left: selection.x }}
//                     >
//                         <button onClick={handleCopySelection} className={`${TOOLBAR_BTN} dark:text-white text-zinc-900`}>
//                             <Copy className="w-3.5 h-3.5" />
//                             Copy
//                         </button>
//                         <div className="w-px h-4 dark:bg-zinc-700 bg-zinc-200 mx-1" />
//                         <button onClick={handleExplainSelection} className={`${TOOLBAR_BTN} dark:text-brand-primary text-blue-500`}>
//                             <Sparkles className="w-3.5 h-3.5" />
//                             Explain
//                         </button>
//                     </div>,
//                     document.body
//                 )
//             }
//         </div>
//     );
// });

// export default TextPreviewPanel;











import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useMemo } from "react";
import { Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { useTextSelection } from "../../hooks/useTextSelection.js";
import { createPortal } from "react-dom";
import { copyText } from "../../hooks/useCopyToClipboard.js";
import { showToast } from "../common/showToast.jsx";
import { getLineRanges } from "../../utils/lineRanges.js";


const LINE_BREAK = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/g;



// function getLineRanges(text) {
//     const ranges = [];
//     let start = 0;
//     for (const match of text.matchAll(LINE_BREAK)) {
//         ranges.push([start, match.index]);
//         start = match.index + match[0].length;
//     }
//     if (start < text.length) ranges.push([start, text.length]); // aakhri line bina newline ke
//     return ranges;
// }



const TextPreviewPanel = forwardRef(function TextPreviewPanel({ documentUrl, onReady, onExplain }, ref) {
    
    const [text, setText] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Highlight-target: { start, end } character-offsets `text` ke andar. null = koi highlight nahi.
    const [highlightRange, setHighlightRange] = useState(null);
    const highlightNodeRef = useRef(null);

    const { selection, toolbarRef, onPointerUp, clear } = useTextSelection();

    const lineRanges = useMemo(() => (text == null ? [] : getLineRanges(text)), [text]);

    const handleCopySelection = async () => {
        const ok = await copyText(selection.text);
        // appToast.info(ok ? "Selection copied!" : "Couldn't copy. Check browser permissions");
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
            // PDF viewer ka interface match karne ke liye: plain text me "page" nahi hota, isliye no-op.
            jumpToPage: () => { },

            // Text/code citation: backend ki exact line range se highlight (fuzzy text-match nahi).
            highlightLines: (startLine, endLine) => {
                if (text == null) return;
                const first = lineRanges[startLine - 1];
                const last = lineRanges[Math.min(endLine, lineRanges.length) - 1];
                if (!first || !last) return; // file badli hui ya line numbers is text se match nahi karte
                setHighlightRange({ start: first[0], end: last[1], trigger: Date.now() });
            },

            // Line numbers na hon (purane chunks) to text-search fallback
            highlightText: (searchText) => {

                if (!searchText || text == null) return;

                const words = searchText.trim().split(/\s+/).filter(Boolean);
                
                if (words.length === 0) return;

                // Har word escape karke beech me \s+ : newline, tab, double space sab chal jate hain
                const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
                const match = text.match(new RegExp(escaped.join("\\s+"), "i"));

                if (!match) {
                    setHighlightRange(null); // match nahi mila: chup-chaap, PDF viewer jaisa
                    return;
                }

                // trigger: har click pe naya object, taaki scroll dobara chale
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

    // Load ho gaya (ya fail): sidebar ko batao, taaki wo ruka hua citation-jump ab chala sake
    useEffect(() => {
        if (!loading) onReady?.();
    }, [loading, onReady]);

    // Naya highlight set ho to us tak scroll
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

    // Highlight ke hisaab se text teen hisson me: pehle, highlighted, baad. Range na ho to poora text.
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

    // font-mono: code files ka indentation aur alignment bacha rehta hai
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