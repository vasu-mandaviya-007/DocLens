
// import { Sparkles, Hash, Copy } from "lucide-react";
// import { memo } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { markdownComponents } from "./MarkdownComponents.jsx";
// import { IconButton, Tooltip } from "@mui/material"
// import { toast } from "react-hot-toast"
// import appToast from "../common/appToast.jsx"; 

// const ChatBubble = memo(function ChatBubble({ message, index }) {

//     const isUser = message.role === "user";

//     const handleCopyPrompt = async () => {

//         await navigator.clipboard.writeText(message?.text);
//         appToast.info("Copied to clipboard")

//     }

//     return (
//         <div
//             className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
//             style={{ animation: "fadeSlideIn 0.3s ease both", animationDelay: `${index * 0.05}s` }}
//         >
//             {!isUser && (
//                 <div className="w-8 h-8 rounded-xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-brand-primary/20">
//                     <Sparkles className="w-4 h-4 text-white" />
//                 </div>
//             )}

//             <div className={`flex flex-col gap-1.5 max-w-[90%] ${isUser ? "items-end" : "items-start"}`}>

//                 {isUser ? (
//                     // <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-linear-to-br from-brand-primary to-brand-secondary text-white shadow-sm shadow-brand-primary/20 text-sm">
//                     //     {message.text}
//                     // </div>
//                     <div className="relative group">
//                         <div className="px-6 py-4 rounded-xl rounded-tr-sm dark:bg-card-highlight bg-surface-highlight text-content-default text-sm">
//                             {message.text}
//                         </div>
//                         <div className="flex mt-1 items-center justify-end invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto group-hover:animate-fade-in">
//                             <Tooltip title={"Copy"} arrow  >
//                                 <IconButton className="" onClick={handleCopyPrompt}>
//                                     <Copy size={15} />
//                                 </IconButton>
//                             </Tooltip>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="relative group text-sm text-zinc-800 dark:text-zinc-300 w-full">
//                         <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
//                             {message.text}
//                         </ReactMarkdown>
//                         <div className="flex mt-1 items-center justify-start invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto group-hover:animate-fade-in">
//                             <Tooltip title={"Copy"} arrow  >
//                                 <IconButton className="" onClick={handleCopyPrompt}>
//                                     <Copy size={15} />
//                                 </IconButton>
//                             </Tooltip>
//                         </div>
//                     </div>
//                 )}

//                 {message.citations?.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 mt-0.5">
//                         {message.citations.map((c, ci) => (
//                             <span
//                                 key={ci}
//                                 className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary dark:text-blue-400 border border-brand-primary/20"
//                             >
//                                 <Hash className="w-2.5 h-2.5" />
//                                 Page {c.page}
//                             </span>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// });

// export default ChatBubble;





// import { Copy } from "lucide-react";
// import { memo, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { markdownComponents } from "./MarkdownComponents.jsx";
// import appToast from "../common/appToast.jsx";

// const ChatBubble = memo(function ChatBubble({ message }) {
//     const isUser = message.role === "user";
//     const [copied, setCopied] = useState(false);

//     const handleCopyPrompt = async () => {
//         await navigator.clipboard.writeText(message.text);
//         appToast.info("Copied to clipboard");
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <div className={`flex w-full animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
//             <div className={`flex flex-col gap-3 w-full max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>

//                 {isUser ? (
//                     <div className="px-6 py-4 rounded-3xl rounded-tr-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[15px] leading-relaxed font-medium shadow-[0_2px_10px_rgb(0,0,0,0.05)]">
//                         {message.text}
//                     </div>
//                 ) : (
//                     <div className="group relative w-full text-[15px] leading-[1.8] text-zinc-800 dark:text-zinc-200">
//                         <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
//                             {message.text}
//                         </ReactMarkdown>

//                         <button
//                             onClick={handleCopyPrompt}
//                             className="absolute -left-12 top-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
//                             title="Copy message"
//                         >
//                             <Copy className="w-4 h-4" strokeWidth={1.5} />
//                         </button>
//                     </div>
//                 )}

//                 {message.citations?.length > 0 && (
//                     <div className="flex flex-wrap gap-2 mt-2">
//                         {message.citations.map((c, ci) => (
//                             <span
//                                 key={ci}
//                                 className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-widest uppercase bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
//                             >
//                                 Page {c.page}
//                             </span>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// });

// export default ChatBubble;














// import { Copy, Check, Hash, Sparkles } from "lucide-react";
// import { memo, useEffect, useRef, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { markdownComponents } from "./MarkdownComponents.jsx";
// import AppToast from "../common/AppToast.jsx";
// import { Button } from "@mui/material";
// import appToast from "../common/AppToast.jsx";

// const ChatBubble = memo(function ChatBubble({ message }) {

//     const bubbleRef = useRef(null);

//     const isUser = message.role === "user";
//     const [copied, setCopied] = useState(false);

//     const handleCopy = async () => {
//         await navigator.clipboard.writeText(message.text);
//         AppToast.info("Copied to clipboard");
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1500);
//     };


//     // --- 1. Selection Tooltip State ---
//     const [popup, setPopup] = useState({ show: false, x: 0, y: 0, text: "" });

//     // --- 2. Hide Popup on Click Away or Scroll ---
//     useEffect(() => {
//         const hidePopup = () => setPopup((p) => ({ ...p, show: false }));

//         // Agar user screen par kahin aur click kare ya scroll kare, toh popup hide kar do
//         document.addEventListener("mousedown", hidePopup);
//         document.addEventListener("scroll", hidePopup, true);

//         return () => {
//             document.removeEventListener("mousedown", hidePopup);
//             document.removeEventListener("scroll", hidePopup, true);
//         };
//     }, []);

//     // --- 3. Capture Text Selection ---
//     const handleMouseUp = () => {
//         // setTimeout isliye taaki browser double-click text selection complete kar le
//         setTimeout(() => {
//             const selection = window.getSelection();
//             const text = selection.toString().trim();

//             if (text.length > 0) {
//                 // Selection ki position nikalna
//                 const range = selection.getRangeAt(0);
//                 const rect = range.getBoundingClientRect();

//                 setPopup({
//                     show: true,
//                     text: text,
//                     // X coordinate: Text ke bilkul center mein
//                     x: rect.left + (rect.width / 2),
//                     // Y coordinate: Text se thoda sa upar (10px)
//                     y: rect.top - 10,
//                 });
//             } else {
//                 setPopup({ show: false, x: 0, y: 0, text: "" });
//             }
//         }, 0);
//     };

//     // --- 4. Tooltip Actions ---
//     const handleCopySelection = (e) => {
//         e.stopPropagation(); // Parent mousedown event ko roko
//         navigator.clipboard.writeText(popup.text);
//         appToast.info("Selection copied!");
//         setPopup({ show: false, x: 0, y: 0, text: "" });
//         window.getSelection().removeAllRanges(); // Deselect text
//     };

//     const handleExplainSelection = (e) => {
//         e.stopPropagation();
//         // Yahan aap apna function call kar sakte hain jo is text ko AI ko bhej kar explain kare
//         console.log("Ask AI about:", popup.text);
//         appToast.info("Sending to AI...");
//         setPopup({ show: false, x: 0, y: 0, text: "" });
//         window.getSelection().removeAllRanges();
//     };


//     return (

//         <div ref={bubbleRef} className={`flex w-full animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>

//             <div className={`flex flex-col gap-2 w-full max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>

//                 {isUser ? (
//                     <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-primary text-white text-[14px] leading-relaxed">
//                         {message.text}
//                     </div>
//                 ) : (
//                     <div onMouseUp={handleMouseUp} className="group relative w-full text-[14px] leading-[1.75] text-content-default">
//                         <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
//                             {message.text}
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

//                 {/* {
//                     !isUser && selectedText && (
//                         <Button
//                             variant="contained"
//                             sx={{
//                                 position: "fixed",
//                                 top: buttonPosition.y,
//                                 left: buttonPosition.x
//                             }}
//                         >
//                             Ask
//                         </Button>
//                     )
//                 } */}

//                 {popup.show && (
//                     <div
//                         onMouseDown={(e) => e.stopPropagation()} // Click karne par hide na ho
//                         className="fixed z-50 flex items-center gap-1 px-1.5 py-1.5 bg-zinc-900 dark:bg-white rounded-xl shadow-xl shadow-black/15 -translate-x-1/2 -translate-y-full animate-fade-in"
//                         style={{ top: popup.y, left: popup.x }}
//                     >
//                         <button
//                             onClick={handleCopySelection}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-white dark:text-zinc-900 transition-colors"
//                         >
//                             <Copy className="w-3.5 h-3.5" />
//                             Copy
//                         </button>

//                         <div className="w-[1px] h-4 bg-zinc-700 dark:bg-zinc-200 mx-1"></div>

//                         <button
//                             onClick={handleExplainSelection}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-brand-primary dark:text-blue-500 transition-colors"
//                         >
//                             <Sparkles className="w-3.5 h-3.5" />
//                             Explain
//                         </button>
//                     </div>
//                 )}

//                 {message.citations?.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5">
//                         {message.citations.map((c, ci) => (
//                             <span
//                                 key={ci}
//                                 className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary"
//                             >
//                                 <Hash className="w-2.5 h-2.5" />
//                                 Page {c.page}
//                             </span>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// });

// export default ChatBubble;










import { Copy, Check, Hash, Sparkles } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"; // <-- ADD THIS
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./MarkdownComponents.jsx";
import AppToast from "../common/AppToast.jsx";
import { Button } from "@mui/material";
import appToast from "../common/AppToast.jsx"; 

const ChatBubble = memo(function ChatBubble({ message, onExplain }) {
    const bubbleRef = useRef(null);
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.text);
        AppToast.info("Copied to clipboard");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    // --- 1. Selection Tooltip State ---
    const [popup, setPopup] = useState({ show: false, x: 0, y: 0, text: "" });

    // --- 2. Hide Popup on Click Away or Scroll ---
    useEffect(() => {
        const hidePopup = () => setPopup((p) => ({ ...p, show: false }));

        document.addEventListener("mousedown", hidePopup);
        document.addEventListener("scroll", hidePopup, true);

        return () => {
            document.removeEventListener("mousedown", hidePopup);
            document.removeEventListener("scroll", hidePopup, true);
        };
    }, []);

    // --- 3. Capture Text Selection ---
    const handleMouseUp = () => {
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setPopup({
                    show: true,
                    text: text,
                    x: rect.left + (rect.width / 2),
                    // Y ko thoda aur upar kiya hai (12px) taaki selection cover na ho
                    y: rect.top - 12,
                });
            } else {
                setPopup({ show: false, x: 0, y: 0, text: "" });
            }
        }, 10); // Thoda timeout badhaya hai better accuracy ke liye
    };

    // --- 4. Tooltip Actions ---
    const handleCopySelection = (e) => {

        e.stopPropagation();
        navigator.clipboard.writeText(popup.text);
        appToast.info("Selection copied!");
        setPopup({ show: false, x: 0, y: 0, text: "" });
        window.getSelection().removeAllRanges();

    };

    const handleExplainSelection = (e) => {

        e.stopPropagation();

        if (onExplain) {
            onExplain(popup.text);
        }

        setPopup({ show: false, x: 0, y: 0, text: "" });
        window.getSelection().removeAllRanges();
    };

    return (
        <div ref={bubbleRef} className={`flex w-full animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col gap-2 w-full max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>

                {isUser ? (
                    <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-primary text-white text-[14px] leading-relaxed">
                        {message.text}
                    </div>
                ) : (

                    // <div onMouseUp={handleMouseUp} className="group relative w-full text-[14px] leading-[1.75] text-content-default">

                    <div
                        onMouseUp={handleMouseUp}
                        className="group relative w-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-[15px]"
                    >

                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {message.text}
                        </ReactMarkdown>

                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy message"
                            title="Copy message"
                            className="mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 text-content-deemphasized hover:text-content-default hover:bg-surface-emphasized transition-all duration-150"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                )}

                {/* THE FLOATING SELECTION TOOLTIP (Wrapped in createPortal) */}
                {popup.show && createPortal(
                    <div
                        onMouseDown={(e) => e.stopPropagation()}
                        // z-[9999] use kiya hai taaki kisi bhi modal ya header se upar rahe
                        className="fixed z-9999 flex items-center gap-1 px-1.5 py-1.5 bg-zinc-900 dark:bg-white rounded-xl shadow-xl shadow-black/15 -translate-x-1/2 -translate-y-full animate-fade-in"
                        style={{ top: popup.y, left: popup.x }}
                    >
                        <button
                            onClick={handleCopySelection}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-white dark:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                        </button>

                        <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-200 mx-1"></div>

                        <button
                            onClick={handleExplainSelection}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 text-[13px] font-medium text-brand-primary dark:text-blue-500 transition-colors cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Explain
                        </button>
                    </div>,
                    document.body // <-- Renders exactly at viewport level
                )}

                {message.citations?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {message.citations.map((c, ci) => (
                            <span
                                key={ci}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary"
                            >
                                <Hash className="w-2.5 h-2.5" />
                                Page {c.page}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default ChatBubble;