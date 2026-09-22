import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Send, Sparkles, ChevronRight, X } from "lucide-react";

const SAMPLE_DOCS = [
    { id: 1, name: "Employment_Contract.pdf", pages: 8, active: true },
    { id: 2, name: "Q3_Financial_Report.pdf", pages: 24, active: false },
    { id: 3, name: "Research_Paper_NLP.pdf", pages: 12, active: false },
];

const SAMPLE_CONVERSATION = [
    {
        role: "user",
        text: "What is the notice period mentioned in this contract?",
    },
    {
        role: "assistant",
        text: "The notice period is 60 days for either party to terminate the agreement, as specified in the termination clause.",
        sources: [
            { page: 4, snippet: "Either party may terminate this agreement by providing sixty (60) days written notice." },
        ],
    },
];

export default function DocumentQA() {
    const [docs] = useState(SAMPLE_DOCS);
    const [messages, setMessages] = useState(SAMPLE_CONVERSATION);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isThinking]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((m) => [...m, { role: "user", text: input }]);
        setInput("");
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            setMessages((m) => [
                ...m,
                {
                    role: "assistant",
                    text: "This is a sample response. Connect your backend to generate real answers grounded in the uploaded document.",
                    sources: [{ page: 2, snippet: "Sample source snippet would appear here, pulled from the retrieved chunk." }],
                },
            ]);
        }, 1400);
    };

    return (
        <div className="h-screen w-full flex bg-[#FAFAF8] text-[#1C1C1A]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Sidebar */}
            <aside className="w-72 shrink-0 border-r border-[#E8E6E1] flex flex-col bg-white">
                <div className="px-5 pt-6 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-md bg-[#2B2B27] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#E8E6E1]" strokeWidth={1.75} />
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                            Folio
                        </span>
                    </div>
                    <p className="text-[12.5px] text-[#8A8778] pl-9">Ask your documents anything</p>
                </div>

                <div className="px-4">
                    <button className="w-full flex items-center justify-center gap-2 border border-[#E8E6E1] rounded-lg py-2.5 text-[13.5px] font-medium text-[#4A4A44] hover:bg-[#F4F2ED] hover:border-[#D8D5CC] transition-colors">
                        <Plus className="w-4 h-4" strokeWidth={1.75} />
                        Add document
                    </button>
                </div>

                <div className="mt-6 px-5 flex-1 overflow-y-auto">
                    <p className="text-[11px] font-medium tracking-wide uppercase text-[#B0AD9F] mb-2.5">Sources</p>
                    <div className="space-y-1">
                        {docs.map((doc) => (
                            <button
                                key={doc.id}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 transition-colors ${doc.active ? "bg-[#F0EEE7]" : "hover:bg-[#F7F6F2]"
                                    }`}
                            >
                                <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${doc.active ? "text-[#8B6F4E]" : "text-[#B0AD9F]"}`} strokeWidth={1.6} />
                                <div className="min-w-0">
                                    <p className={`text-[13px] leading-tight truncate ${doc.active ? "text-[#2B2B27] font-medium" : "text-[#5C5A52]"}`}>
                                        {doc.name}
                                    </p>
                                    <p className="text-[11.5px] text-[#B0AD9F] mt-0.5">{doc.pages} pages</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-[#E8E6E1] flex items-center px-6 shrink-0 bg-white">
                    <FileText className="w-4 h-4 text-[#8B6F4E] mr-2" strokeWidth={1.75} />
                    <span className="text-[13.5px] font-medium text-[#2B2B27]">Employment_Contract.pdf</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9C6BB] mx-2" />
                    <span className="text-[13px] text-[#8A8778]">8 pages · uploaded today</span>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-16 py-8">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
                                {msg.role === "user" ? (
                                    <div className="bg-[#2B2B27] text-[#F4F2ED] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md text-[14px] leading-relaxed">
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <p className="text-[14.5px] leading-relaxed text-[#2B2B27]">{msg.text}</p>
                                        {msg.sources && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {msg.sources.map((s, j) => (
                                                    <div
                                                        key={j}
                                                        className="group relative border border-[#E8E6E1] bg-white rounded-lg px-3 py-1.5 text-[12px] text-[#8A8778] hover:border-[#D8D5CC] cursor-default transition-colors"
                                                    >
                                                        <span className="font-medium text-[#8B6F4E]">Page {s.page}</span>
                                                        <span className="ml-1.5">"{s.snippet.slice(0, 40)}..."</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div> 
                        ))}

                        {isThinking && (
                            <div className="flex items-center gap-1.5 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9C6BB] animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9C6BB] animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9C6BB] animate-bounce" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-[#E8E6E1] bg-white px-6 md:px-16 py-4 shrink-0">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-end gap-2 border border-[#E8E6E1] rounded-xl px-3 py-2 focus-within:border-[#B0AD9F] transition-colors bg-[#FAFAF8]">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask a question about this document..."
                                rows={1}
                                className="flex-1 resize-none bg-transparent outline-none text-[14px] text-[#2B2B27] placeholder:text-[#B0AD9F] py-1.5 max-h-32"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                aria-label="Send message"
                                className="w-8 h-8 rounded-lg bg-[#2B2B27] disabled:bg-[#D8D5CC] flex items-center justify-center shrink-0 transition-colors"
                            >
                                <Send className="w-3.5 h-3.5 text-[#F4F2ED]" strokeWidth={2} />
                            </button>
                        </div>
                        <p className="text-[11px] text-[#B0AD9F] text-center mt-2">Answers are grounded in your uploaded documents</p>
                    </div>
                </div>
            </main>
        </div>
    );
}