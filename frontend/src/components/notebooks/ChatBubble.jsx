
// import { Copy, Check, Hash, Sparkles } from "lucide-react";
// import { memo, useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { markdownComponents } from "./MarkdownComponents.jsx";
// import { IconButton, Tooltip } from "@mui/material";
// import CitationChip from "./CitationChip.jsx";
// import { showToast } from "../common/showToast.jsx";


// const CODE_SPLIT_RE = /(```[\s\S]*?```|```[\s\S]*$|`[^`\n]+`)/;
// const CITE_RE = /[\[【](\d+)[\]】](?!\()/g;


// function linkifyCitations(text) {
//     return text
//         .split(CODE_SPLIT_RE)
//         .map((part, i) => (i % 2 === 1 ? part : part.replace(CITE_RE, "[$1](#cite-$1)")))
//         .join("");
// }


// const ChatBubble = memo(function ChatBubble({ message, onExplain, onCitationClick }) {

//     const bubbleRef = useRef(null);
//     const isUser = message.role === "user";
//     const [copied, setCopied] = useState(false);

//     const textWithCites = useMemo(
//         () => linkifyCitations(message.text),
//         [message.text]
//     );

//     const lookup = message.sources ?? message.citations;

//     const components = useMemo(() => ({
//         ...markdownComponents,
//         a: ({ href, children, ...props }) => {
//             if (href?.startsWith("#cite-")) {
//                 const id = Number(href.slice(6));
//                 const c = lookup?.find((x) => x.id === id);
//                 if (!c) return null;
//                 return <CitationChip citation={c} onViewSource={onCitationClick} />;
//             }
//             return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
//         },
//     }), [lookup, onCitationClick]);


//     const handleCopy = async () => {
//         await navigator.clipboard.writeText(message.text);
//         showToast("Copied to clipboard","info");
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1500);
//     };


//     const [popup, setPopup] = useState({ show: false, x: 0, y: 0, text: "" });


//     useEffect(() => {
//         const hidePopup = () => setPopup((p) => ({ ...p, show: false }));
//         document.addEventListener("mousedown", hidePopup);
//         document.addEventListener("scroll", hidePopup, true);
//         return () => {
//             document.removeEventListener("mousedown", hidePopup);
//             document.removeEventListener("scroll", hidePopup, true);
//         };
//     }, []);


//     const handleMouseUp = () => {
//         setTimeout(() => {
//             const selection = window.getSelection();
//             const text = selection.toString().trim();

//             if (text.length > 0) {
//                 const range = selection.getRangeAt(0);
//                 const rect = range.getBoundingClientRect();

//                 setPopup({
//                     show: true,
//                     text: text,
//                     x: rect.left + (rect.width / 2),
//                     y: rect.top - 12,
//                 });
//             } else {
//                 setPopup({ show: false, x: 0, y: 0, text: "" });
//             }
//         }, 10);
//     };


//     const handleCopySelection = (e) => {
//         e.stopPropagation();
//         navigator.clipboard.writeText(popup.text);
//         showToast("Selection copied!","info");
//         setPopup({ show: false, x: 0, y: 0, text: "" });
//         window.getSelection().removeAllRanges();
//     };


//     const handleExplainSelection = (e) => {
//         e.stopPropagation();
//         if (onExplain) onExplain(popup.text);
//         setPopup({ show: false, x: 0, y: 0, text: "" });
//         window.getSelection().removeAllRanges();
//     };


//     return (

//         <div ref={bubbleRef} className={`flex w-full font-display animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>

//             <div className={`flex flex-col gap-2 w-full max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>

//                 {isUser ? (

//                     <div className="relative group">
//                         <div className="px-6 py-4 rounded-xl rounded-tr-sm dark:bg-card-highlight bg-surface-highlight text-content-default text-sm">
//                             {message.text}
//                         </div>
//                         <div className="flex mt-1 items-center justify-end invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto group-hover:animate-fade-in">
//                             <Tooltip title={"Copy"} arrow  >
//                                 <IconButton className="" onClick={handleCopy}>
//                                     <Copy size={15} />
//                                 </IconButton>
//                             </Tooltip>
//                         </div>
//                     </div>

//                 ) : (
//                     <div
//                         onMouseUp={handleMouseUp}
//                         className="group relative w-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none max-w-none text-[15px]"
//                     >
//                         <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
//                             {textWithCites}
//                         </ReactMarkdown>

//                         <button
//                             type="button"
//                             onClick={handleCopy}
//                             aria-label="Copy message"
//                             title="Copy message"
//                             className="mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 text-content-deemphasized hover:text-content-default hover:bg-surface-emphasized transition-all duration-150"
//                         >
//                             {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
//                         </button>
//                     </div>
//                 )}

//                 {popup.show && createPortal(
//                     <div
//                         onMouseDown={(e) => e.stopPropagation()}
//                         className="fixed z-9999 flex items-center gap-1 px-1.5 py-1.5 bg-zinc-900 dark:bg-white rounded-xl shadow-xl shadow-black/15 -translate-x-1/2 -translate-y-full animate-fade-in"
//                         style={{ top: popup.y, left: popup.x }}
//                     >
//                         <button
//                             onClick={handleCopySelection}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-white dark:text-zinc-900 transition-colors cursor-pointer"
//                         >
//                             <Copy className="w-3.5 h-3.5" />
//                             Copy
//                         </button>
//                         <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-200 mx-1"></div>
//                         <button
//                             onClick={handleExplainSelection}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-brand-primary dark:text-blue-500 transition-colors cursor-pointer"
//                         >
//                             <Sparkles className="w-3.5 h-3.5" />
//                             Explain
//                         </button>
//                     </div>,
//                     document.body
//                 )}

//                 {message.citations?.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5">
//                         {message.citations.map((c, ci) => (
//                             <button
//                                 key={ci}
//                                 type="button"
//                                 onClick={() => onCitationClick?.(c)}
//                                 className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
//                                 title={c.snippet}
//                             >
//                                 <Hash className="w-2.5 h-2.5" />
//                                 Page {c.page}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

// });

// export default ChatBubble;











import { Check, Copy, Hash, Sparkles } from "lucide-react";
import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { IconButton, Tooltip } from "@mui/material";
import { hidePartialCitation, stripCitations } from "./citations.js";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import { copyText, useCopyToClipboard } from "../../hooks/useCopyToClipboard.js";
import { useTextSelection } from "../../hooks/useTextSelection.js";
import DropdownMenu from "../common/DropdownMenu.jsx";
import { showToast } from "../common/showToast.jsx";

const TOOLBAR_BTN =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium transition-colors cursor-pointer";

const ChatBubble = memo(function ChatBubble({ message, onExplain, onCitationClick }) {

    const isUser = message.role === "user";
    const { copied, copy } = useCopyToClipboard();
    const { selection, toolbarRef, onPointerUp, clear } = useTextSelection();

    const displayText = useMemo(() => hidePartialCitation(message.text), [message.text]);

    const lookup = message.sources ?? message.citations;


    const footerCitations = useMemo(
        () => [
            ...new Map((message.citations ?? []).map((c) => [c.label ?? `Page ${c.page}`, c])).values()
        ].sort((a, b) => {
            const labelA = a.label ?? (a.page ? `Page ${a.page}` : "");
            const labelB = b.label ?? (b.page ? `Page ${b.page}` : "");

            const labelCompare = labelA.localeCompare(labelB, undefined, { numeric: true, sensitivity: 'base' });

            if (labelCompare === 0) {
                return (a.page ?? 0) - (b.page ?? 0);
            }

            return labelCompare;
        }),
        [message.citations]
    );

    const handleCopy = async () => {
        const ok = await copy(isUser ? message.text : stripCitations(message.text));
        showToast(ok ? "Copied to clipboard" : "Couldn't copy. Check browser permissions", "info")
    };

    const handleCopySelection = async () => {
        const ok = await copyText(selection.text);
        showToast(ok ? "Selection copied!" : "Couldn't copy. Check browser permissions");
        clear();
    };

    const handleExplainSelection = () => {
        onExplain?.(selection.text);
        clear();
    };

    const messageMenuItems = [
        {
            id: "copy",
            label: "Copy Text",
            onClick: () => handleCopy(),
        },
    ];

    return (
        <div className={`flex w-full font-display animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex group flex-col gap-2 w-full max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                {isUser ? (
                    <div className="relative group">
                        {/* whitespace-pre-wrap: pasted code/multi-line text ka format bacha rahe */}
                        {/* <div
                            className="px-6 py-4 rounded-xl rounded-tr-sm bg-primary text-white text-sm whitespace-pre-wrap wrap-break-word"
                        >
                            {message.text}
                        </div> */}

                        <DropdownMenu
                            triggerOn="hold"
                            holdDelay={500}
                            align="right"
                            items={messageMenuItems}
                            trigger={(triggerProps) => (
                                <div
                                    {...triggerProps}
                                    className="px-6 py-4 rounded-xl rounded-tr-sm bg-primary text-white text-sm whitespace-pre-wrap wrap-break-word select-none cursor-pointer active:scale-[0.98] transition-transform"
                                >
                                    {message.text}
                                </div>
                            )}
                        />

                    </div>
                ) : (
                    <div
                        onPointerUp={onPointerUp}
                        className="group relative w-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none max-w-none text-[15px]"
                    >
                        <MarkdownRenderer text={displayText} citations={lookup} onCitationClick={onCitationClick} />

                    </div>
                )}

                {selection &&
                    createPortal(
                        <div
                            ref={toolbarRef}
                            className="fixed z-9999 flex items-center gap-1 px-1.5 py-1.5 bg-zinc-900 dark:bg-white rounded-xl shadow-xl shadow-black/15 -translate-x-1/2 -translate-y-full animate-fade-in"
                            style={{ top: selection.y, left: selection.x }}
                        >
                            <button onClick={handleCopySelection} className={`${TOOLBAR_BTN} text-white dark:text-zinc-900`}>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </button>
                            <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-200 mx-1" />
                            <button onClick={handleExplainSelection} className={`${TOOLBAR_BTN} text-brand-primary dark:text-blue-500`}>
                                <Sparkles className="w-3.5 h-3.5" />
                                Explain
                            </button>
                        </div>,
                        document.body
                    )
                }

                {footerCitations.length > 0 && (
                    <div className="flex mt-2 flex-wrap gap-1.5">
                        {footerCitations.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => onCitationClick?.(c)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                                title={c.plain ?? c.snippet}
                            >
                                <Hash className="w-2.5 h-2.5" />
                                {c.label ?? `Page ${c.page}`}
                            </button>
                        ))}
                    </div>
                )}

                {isUser ? (
                    <div className="flex mt-1 items-center justify-end visible md:invisible pointer-events-auto md:pointer-events-none group-hover:visible group-hover:pointer-events-auto group-hover:animate-fade-in">
                        <Tooltip title="Copy" arrow>
                            <IconButton onClick={handleCopy}>
                                <Copy size={15} />
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : (
                    message.text && (

                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy message"
                            title="Copy message"
                            className="mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md text-content-default hover:text-content-default hover:bg-surface-emphasized transition-all duration-150"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )
                    
                )}

            </div>

        </div>

    );

});


export default ChatBubble;