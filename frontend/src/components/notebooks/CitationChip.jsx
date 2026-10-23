import { useEffect, useRef, useState } from "react";
import { Popper } from "@mui/material";
import { markdownComponents } from "./MarkdownComponents.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const POPPER_MODIFIERS = [
    { name: "offset", options: { offset: [0, 8] } },
    { name: "flip", enabled: false },
    { name: "preventOverflow", options: { padding: 8, altAxis: false } },
];


const POPUP_HEIGHT_ESTIMATE = 320;


const labelOf = (citation) => citation.label ?? (citation.page != null ? `Page ${citation.page}` : "Source");


const shortLabel = (label) => label.replace(/^Page /, "p.").replace(/^Lines /, "L");


export default function CitationChip({ citation, onViewSource }) { 
    const [anchorEl, setAnchorEl] = useState(null);
    const [placement, setPlacement] = useState("bottom"); 
    const closeTimer = useRef(null);
    const open = Boolean(anchorEl);

    const label = labelOf(citation);
    const isLineBased = citation.start_line != null;

    const show = (e) => {
        clearTimeout(closeTimer.current);
        if (open) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

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