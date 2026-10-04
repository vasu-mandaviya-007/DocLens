

import { BookOpen, Copy, CornerDownRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 
import { markdownComponents } from "./MarkdownComponents.jsx";
import toast from "react-hot-toast"; 
import { showToast } from "../common/showToast.jsx";

const MAX_SUGGESTIONS = 3;

const DEFAULT_SUGGESTIONS = [
    "Summarize this document in 3 bullet points",
    "What are the key findings?",
    "What is the main topic of this document?",
];

export default function DocumentSummary({ doc, onSuggestionClick, showSuggestions = true }) {
    const suggestions = (
        doc?.suggested_questions?.length > 0 ? doc.suggested_questions : DEFAULT_SUGGESTIONS
    ).slice(0, MAX_SUGGESTIONS);

    const title = (doc?.filename || "Your Document").replace(/\.[^.]+$/, "");
    const meta = ["1 source", doc?.page_count ? `${doc.page_count} pages` : null]
        .filter(Boolean)
        .join(" · ");


    const handleCopy = async () => {
        await navigator.clipboard.writeText(doc.summary);
        // appToast.info("Copied to clipboard"); 
        showToast("Copied to clipboard","info")

        // setCopied(true);
        // setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="w-full pb-4 animate-fade-in">

            <div className="p-6 bg-surface-highlight hover:bg-surface-emphasized/70 rounded-xl mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-emphasized border border-lines-divider flex items-center justify-center mb-5">
                    <BookOpen className="w-5 h-5 text-brand-primary" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl md:text-4xl font-normal leading-tight text-content-default mb-2">
                    {title}
                </h2>
                <p className="text-[13px] text-content-deemphasized ">{meta}</p>
            </div>

            <div className="px-4">
                {doc?.summary ? (
                    <div className="group prose prose-zinc dark:prose-invert max-w-none text-[15px] font-display prose-p:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} >
                            {doc.summary}
                        </ReactMarkdown> 
                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy message"
                            title="Copy message" 
                            className="mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md opacity-100 group-hover:opacity-100 text-content-deemphasized hover:text-content-default hover:bg-surface-emphasized transition-all duration-150"
                        >
                            {/* {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} */}
                            <Copy className="w-3.5 h-3.5" />
                        </button>
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
                                className="text-left p-6 rounded-2xl text-[14px] font-display font-medium text-content-default/80 bg-card-surface hover:bg-card-surface-hover border border-transparent hover:border-lines-divider  transition-colors cursor-pointer line-clamp-3"
                            >
                                <div className="flex flex-col gap-4 h-full">
                                    <div className="grow">{q}</div>
                                    <CornerDownRight className="size-4" strokeWidth={3} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


