


// ================================================================================
// DESIGN - 1
// ================================================================================



// import { MessageSquare } from "lucide-react";

// const STARTER_QUESTIONS = [
//     "Summarize this document in 3 bullet points",
//     "What are the key findings?",
//     "List all action items or next steps",
//     "What is the main topic of this document?",
// ];

// export default function ChatEmptyState({ docName, onSuggestionClick }) { 
//     return (
//         <div className="flex flex-col items-center justify-center gap-7 py-16 px-6">
//             <div className="w-14 h-14 rounded-2xl bg-surface-emphasized flex items-center justify-center">
//                 <MessageSquare className="w-6 h-6 text-content-deemphasized" strokeWidth={1.75} />
//             </div>

//             <div className="text-center space-y-1.5 max-w-sm">
//                 <h3 className="text-[17px] font-semibold text-content-default tracking-[-0.01em]">
//                     Ready to answer your questions
//                 </h3>
//                 <p className="text-[13px] text-content-deemphasized leading-relaxed">
//                     Ask anything about{" "} 
//                     <span className="font-medium text-content-default">{docName || "your document"}</span>
//                     {" "}— every answer is grounded in the document.
//                 </p>
//             </div>

//             <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {STARTER_QUESTIONS.map((q) => (
//                     <button
//                         key={q}
//                         type="button"
//                         onClick={() => onSuggestionClick(q)}
//                         className="text-left p-3 rounded-xl text-[13px] font-medium text-content-deemphasized bg-surface-emphasized hover:text-content-default hover:bg-primary/10 transition-colors duration-200"
//                     >
//                         {q}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }







// ================================================================================
// DESIGN - 2
// ================================================================================



// import { Sparkles } from "lucide-react";

// const STARTER_QUESTIONS = [
//     "Summarize this document in 3 bullet points",
//     "What are the key findings?",
//     "List all action items or next steps",
//     "What is the main topic of this document?",
// ];

// export default function ChatEmptyState({ docName, onSuggestionClick }) {
//     return (
//         <div className="flex flex-col items-center justify-center gap-10 py-16 px-6 animate-fade-in">
//             <div className="text-center space-y-3 max-w-md">
//                 <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
//                     How can I help you today?
//                 </h3>
//                 <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
//                     Ask me anything about <span className="text-zinc-900 dark:text-zinc-200 font-medium">{docName || "your document"}</span>.
//                 </p>
//             </div>

//             <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {STARTER_QUESTIONS.map((q) => (
//                     <button
//                         key={q}
//                         type="button"
//                         onClick={() => onSuggestionClick(q)}
//                         className="group flex items-center gap-3 p-4 rounded-2xl text-left text-[14px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-black/10 dark:hover:border-white/10 transition-all duration-300"
//                     >
//                         <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform duration-300 shrink-0">
//                             <Sparkles className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
//                         </span>
//                         <span className="leading-snug">{q}</span>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }












// ================================================================================
// NEW LOOK
// ================================================================================




// import { BookOpen, Sparkles } from "lucide-react";

// export default function ChatEmptyState({ doc, onSuggestionClick }) { 
//     // Agar questions aaye hain to wo use karo, warna default dikhao
//     const suggestions = doc?.suggested_questions?.length > 0
//         ? doc.suggested_questions
//         : [
//             "Summarize this document in 3 bullet points",
//             "What are the key findings?",
//             "List all action items or next steps",
//             "What is the main topic of this document?",
//         ];

//     const hasSummary = !!doc?.summary;

//     return (
//         <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6 py-12 md:py-20 animate-fade-in">

//             {/* Header Icon */}
//             <div className="w-16 h-16 rounded-2xl bg-surface-emphasized border border-lines-divider flex items-center justify-center mb-6 shadow-sm">
//                 <BookOpen className="w-7 h-7 text-brand-primary" strokeWidth={1.5} />
//             </div>

//             {/* Document Title & Summary (The NotebookLM feel) */}
//             <div className="text-center w-full mb-10">
//                 <h2 className="text-xl md:text-2xl font-semibold text-content-default mb-4">
//                     {doc?.filename || "Your Document"}
//                 </h2>

//                 {hasSummary ? (
//                     <p className="text-[14px] leading-relaxed text-content-deemphasized bg-surface-highlight p-5 rounded-xl border border-lines-divider shadow-sm text-left">
//                         <span className="font-semibold text-content-default flex items-center gap-2 mb-2">
//                             <Sparkles className="w-4 h-4 text-brand-primary" /> AI Overview
//                         </span>
//                         {doc.summary}
//                     </p>
//                 ) : (
//                     <p className="text-[14px] text-content-deemphasized">
//                         Ask anything about this document — every answer is grounded in the text.
//                     </p>
//                 )}
//             </div>

//             {/* Dynamic Suggested Questions */}
//             <div className="w-full">
//                 <p className="text-[12px] font-medium text-content-deemphasized uppercase tracking-wider mb-3 px-1">
//                     Suggested Questions
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {suggestions.map((q, idx) => (
//                         <button
//                             key={idx}
//                             type="button"
//                             onClick={() => onSuggestionClick(q)}
//                             className="text-left p-3.5 rounded-xl text-[13.5px] font-medium text-content-deemphasized bg-surface-emphasized border border-transparent hover:border-lines-divider hover:text-content-default hover:bg-surface-default hover:shadow-sm transition-all duration-200 group flex items-start gap-3"
//                         >
//                             <span className="w-5 h-5 rounded-full bg-surface-default flex items-center justify-center text-[10px] text-brand-primary font-bold shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
//                                 {idx + 1}
//                             </span>
//                             <span className="leading-snug">{q}</span>
//                         </button>
//                     ))}
//                 </div>
//             </div>

//         </div>
//     );
// }











import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./MarkdownComponents.jsx";

const MAX_SUGGESTIONS = 3;

const DEFAULT_SUGGESTIONS = [
    "Summarize this document in 3 bullet points",
    "What are the key findings?",
    "What is the main topic of this document?",
];

export default function ChatEmptyState({ doc, onSuggestionClick, showSuggestions = true }) {
    const suggestions = (
        doc?.suggested_questions?.length > 0 ? doc.suggested_questions : DEFAULT_SUGGESTIONS
    ).slice(0, MAX_SUGGESTIONS);

    const title = (doc?.filename || "Your Document").replace(/\.[^.]+$/, "");
    const meta = ["1 source", doc?.page_count ? `${doc.page_count} pages` : null]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="w-full pb-4 animate-fade-in">

            <div className="w-12 h-12 rounded-2xl bg-surface-emphasized border border-lines-divider flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5 text-brand-primary" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl md:text-4xl font-normal leading-tight text-content-default mb-2">
                {title}
            </h2>
            <p className="text-[13px] text-content-deemphasized mb-6">{meta}</p>

            {doc?.summary ? (
                <div className="prose prose-zinc dark:prose-invert max-w-none text-[15px] prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} >
                        {doc.summary}
                    </ReactMarkdown> 
                </div>
            ) : (
                <p className="text-[14px] text-content-deemphasized">
                    Ask anything about this document. Every answer is grounded in the text.
                </p>
            )}

            {showSuggestions && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {suggestions.map((q, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onSuggestionClick(q)}
                            className="text-left p-4 rounded-2xl text-[13.5px] leading-snug font-medium text-content-default bg-surface-emphasized border border-transparent hover:border-lines-divider hover:bg-surface-highlight transition-colors cursor-pointer line-clamp-3"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}


