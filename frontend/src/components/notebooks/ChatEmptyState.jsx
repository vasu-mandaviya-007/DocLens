// import { Sparkles, MessageSquare } from "lucide-react";

// const STARTER_QUESTIONS = [
//     "Summarize this document in 3 bullet points",
//     "What are the key findings?",
//     "List all action items or next steps",
//     "What is the main topic of this document?",
// ]; 

// export default function ChatEmptyState({ docName, onSuggestionClick }) { 
//     return (
//         <div className="flex flex-col items-center justify-center gap-8 py-16 px-6">
//             <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/20 flex items-center justify-center">
//                 <MessageSquare className="w-7 h-7 text-brand-primary dark:text-blue-400" />
//             </div>

//             <div className="text-center space-y-2 max-w-sm">
//                 <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
//                     Ready to answer your questions
//                 </h3>
//                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
//                     Ask anything about{" "}
//                     <span className="font-semibold text-zinc-700 dark:text-zinc-300">{docName}</span>
//                     {" "}— every answer is grounded in the document. 
//                 </p>
//             </div>

//             <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {STARTER_QUESTIONS.map((q) => (
//                     <button
//                         key={q}
//                         onClick={() => onSuggestionClick(q)}
//                         className="group flex items-start gap-2.5 p-3 rounded-xl text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary dark:hover:text-blue-400 transition-all duration-150"
//                     >
//                         <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-primary/60 dark:text-blue-500 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors" />
//                         {q}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }








// ================================================================================
// CLAUDE 
// ================================================================================





// import { Sparkles, MessageSquare } from "lucide-react";

// const STARTER_QUESTIONS = [
//     "Summarize this document in 3 bullet points",
//     "What are the key findings?",
//     "List all action items or next steps",
//     "What is the main topic of this document?",
// ];

// export default function ChatEmptyState({ docName, onSuggestionClick }) {
//     return (
//         <div className="flex flex-col items-center justify-center gap-8 py-16 px-6">
//             <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/20 flex items-center justify-center">
//                 <MessageSquare className="w-7 h-7 text-brand-primary dark:text-blue-400" />
//             </div>

//             <div className="text-center space-y-2 max-w-sm">
//                 <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
//                     Ready to answer your questions
//                 </h3>
//                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
//                     Ask anything about{" "}
//                     <span className="font-semibold text-zinc-700 dark:text-zinc-300">{docName || "your document"}</span>
//                     {" "}— every answer is grounded in the document.
//                 </p>
//             </div>

//             <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {STARTER_QUESTIONS.map((q) => (
//                     <button
//                         key={q}
//                         type="button"
//                         onClick={() => onSuggestionClick(q)}
//                         className="group flex items-start gap-2.5 p-3 rounded-xl text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary dark:hover:text-blue-400 transition-all duration-150"
//                     >
//                         <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-primary/60 dark:text-blue-500 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors" />
//                         {q}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }



import { MessageSquare } from "lucide-react";

const STARTER_QUESTIONS = [
    "Summarize this document in 3 bullet points",
    "What are the key findings?",
    "List all action items or next steps",
    "What is the main topic of this document?",
];

export default function ChatEmptyState({ docName, onSuggestionClick }) {
    return (
        <div className="flex flex-col items-center justify-center gap-7 py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-emphasized flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-content-deemphasized" strokeWidth={1.75} />
            </div>

            <div className="text-center space-y-1.5 max-w-sm">
                <h3 className="text-[17px] font-semibold text-content-default tracking-[-0.01em]">
                    Ready to answer your questions
                </h3>
                <p className="text-[13px] text-content-deemphasized leading-relaxed">
                    Ask anything about{" "} 
                    <span className="font-medium text-content-default">{docName || "your document"}</span>
                    {" "}— every answer is grounded in the document.
                </p>
            </div>

            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                    <button
                        key={q}
                        type="button"
                        onClick={() => onSuggestionClick(q)}
                        className="text-left p-3 rounded-xl text-[13px] font-medium text-content-deemphasized bg-surface-emphasized hover:text-content-default hover:bg-primary/10 transition-colors duration-200"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );
}







// ================================================================================
// GEMINI
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