// import { useEffect, useRef, useState } from "react";
// import { Popper } from "@mui/material";
// import { markdownComponents } from "./MarkdownComponents.jsx";  
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// // Component ke bahar constant: har render pe naye object nahi bante,
// // isliye Popper apni position baar-baar recompute nahi karta.
// const POPPER_MODIFIERS = [
//     { name: "offset", options: { offset: [0, 8] } },
//     { name: "flip", enabled: false },
//     // Sirf horizontal me screen ke andar rakho
//     { name: "preventOverflow", options: { padding: 8, altAxis: false } },
// ];


// const POPUP_HEIGHT_ESTIMATE = 320; // header + content(max 224) + footer

// export default function CitationChip({ citation, onViewSource }) {

//     const [anchorEl, setAnchorEl] = useState(null); 
//     const [placement, setPlacement] = useState("bottom");
//     const closeTimer = useRef(null);
//     const open = Boolean(anchorEl);

//     const show = (e) => {
//         clearTimeout(closeTimer.current);
//         if (open) return; // pehle se khula hai: position dobara mat badlo

//         const rect = e.currentTarget.getBoundingClientRect();
//         const spaceBelow = window.innerHeight - rect.bottom;
//         const spaceAbove = rect.top;

//         // Neeche jagah ho to neeche, warna jahan zyada jagah ho wahan
//         setPlacement(
//             spaceBelow >= POPUP_HEIGHT_ESTIMATE || spaceBelow >= spaceAbove
//                 ? "bottom"
//                 : "top"
//         );
//         setAnchorEl(e.currentTarget);
//     };

//     const hide = () => {
//         closeTimer.current = setTimeout(() => setAnchorEl(null), 150);
//     };

//     useEffect(() => () => clearTimeout(closeTimer.current), []);

//     return (
//         <>
//             <button
//                 type="button"
//                 onMouseEnter={show}
//                 onMouseLeave={hide}
//                 onFocus={show}
//                 onBlur={hide}
//                 onClick={show}
//                 className="inline-flex items-center mx-0.5 px-1.5 rounded text-[11px] font-medium align-baseline bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
//             >
//                 p.{citation.page}
//             </button> 

//             <Popper
//                 open={open}
//                 anchorEl={anchorEl}
//                 placement={placement}
//                 modifiers={POPPER_MODIFIERS}
//                 style={{ zIndex: 9999 }}
//                 sx={{ bgcolor: "background.paper" }}
//             >
//                 <div
//                     onMouseEnter={show}
//                     onMouseLeave={hide}
//                     className="w-90 max-w-[calc(100vw-16px)] rounded-xl border border-zinc-200 dark:border-zinc-800  shadow-xl shadow-black/20 overflow-hidden"
//                 >
//                     <div className="px-4 py-2.5 text-[13px] font-semibold border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
//                         Page {citation.page}
//                     </div>

//                     {/* overscroll-contain: scroll khatam hone par page nahi hilega */}
//                     <div className="prose prose-zinc dark:prose-invert  px-4 py-3 max-h-56 overflow-y-auto overscroll-contain text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
//                         <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} > 
//                             {citation.snippet} 
//                         </ReactMarkdown>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={() => {
//                             setAnchorEl(null);
//                             onViewSource?.(citation);
//                         }}
//                         className="w-full text-left px-4 py-2.5 text-[13px] font-medium border-t border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
//                     >
//                         View source
//                     </button>
//                 </div>
//             </Popper>
//         </>
//     );
// }













import { useEffect, useRef, useState } from "react";
import { Popper } from "@mui/material";
import { markdownComponents } from "./MarkdownComponents.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Component ke bahar constant: har render pe naye object nahi bante,
// isliye Popper apni position baar-baar recompute nahi karta.
const POPPER_MODIFIERS = [
    { name: "offset", options: { offset: [0, 8] } },
    { name: "flip", enabled: false },
    // Sirf horizontal me screen ke andar rakho
    { name: "preventOverflow", options: { padding: 8, altAxis: false } },
];

const POPUP_HEIGHT_ESTIMATE = 320; // header + content(max 224) + footer

// Backend `label` deta hai ("Page 3", "Lines 10–60", "Section 2"): file type ke hisab se.
// `page` ka fallback purane messages ke liye hai jinme label nahi hota.
const labelOf = (citation) => citation.label ?? (citation.page != null ? `Page ${citation.page}` : "Source");

// Chip pe chhota form: "Page 3" -> "p.3", "Lines 10–60" -> "L10–60"
const shortLabel = (label) => label.replace(/^Page /, "p.").replace(/^Lines /, "L");

export default function CitationChip({ citation, onViewSource }) { 
    const [anchorEl, setAnchorEl] = useState(null);
    const [placement, setPlacement] = useState("bottom"); 
    const closeTimer = useRef(null);
    const open = Boolean(anchorEl);

    // useEffect(()=>{
    //     console.log(citation);
    // },[])
    

    const label = labelOf(citation);
    // txt / md / code chunks me start_line hota hai: unka raw text jaisa hai waisa dikhao.
    // Markdown banake dikhane se code ke `#`, `*`, indentation bigad jate hain.
    const isLineBased = citation.start_line != null;

    const show = (e) => {
        clearTimeout(closeTimer.current);
        if (open) return; // pehle se khula hai: position dobara mat badlo

        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Neeche jagah ho to neeche, warna jahan zyada jagah ho wahan
        setPlacement(spaceBelow >= POPUP_HEIGHT_ESTIMATE || spaceBelow >= spaceAbove ? "bottom" : "top");
        setAnchorEl(e.currentTarget);
    };

    const hide = () => {
        closeTimer.current = setTimeout(() => setAnchorEl(null), 150);
    };

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    return (
        <>
            <button
                type="button"
                onClick={()=> onViewSource(citation)}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                className="inline-flex items-center mx-0.5 px-1.5 rounded text-[11px] font-medium align-baseline bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
                {shortLabel(label)}
            </button>

            <Popper
                open={open}
                anchorEl={anchorEl}
                placement={placement}
                modifiers={POPPER_MODIFIERS}
                style={{ zIndex: 9999 }}
                sx={{ bgcolor: "background.paper" }}
            >
                <div
                    onMouseEnter={show}
                    onMouseLeave={hide}
                    className="w-90 max-w-[calc(100vw-16px)] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/20 overflow-hidden"
                >
                    <div className="px-4 py-2.5 text-[13px] font-semibold border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                        {label}
                    </div>

                    {/* overscroll-contain: scroll khatam hone par page nahi hilega */}
                    <div className="px-4 py-3 max-h-56 overflow-y-auto overscroll-contain text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {isLineBased ? (
                            <pre className="whitespace-pre-wrap wrap-break-word font-mono text-[12px]">
                                {citation.snippet}
                            </pre>
                        ) : (
                            <div className="prose prose-zinc dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {citation.snippet}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setAnchorEl(null);
                            onViewSource?.(citation);
                        }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-medium border-t border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        View source
                    </button>
                </div>
            </Popper>
        </>
    );
}