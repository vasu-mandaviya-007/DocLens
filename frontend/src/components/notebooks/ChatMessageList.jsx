import { Sparkles, ArrowDown } from "lucide-react";
import { Fab } from "@mui/material";
import ChatEmptyState from "./ChatEmptyState.jsx";
import ChatBubble from "./ChatBubble.jsx";

export default function ChatMessageList({
    messages,
    docFilename,
    onSuggestionClick,
    onExplain,
    isTyping,
    pendingTextRef,
    chatBoxRef,
    handleChatScroll,
    showScrollButton,
    scrollToBottom,
}) {

    return (

        <div className="relative flex-1 overflow-hidden">

            <div ref={chatBoxRef} onScroll={handleChatScroll} className="h-full overflow-y-auto">

                <div className="max-w-250 mx-auto px-4 sm:px-6 py-6 space-y-4">

                    {messages.length === 0 ? (

                        <ChatEmptyState docName={docFilename} onSuggestionClick={onSuggestionClick} />
                    ) : (

                        messages.map((m, i) => (
                            <ChatBubble
                                key={m.id}
                                index={i}
                                message={m}
                                onSuggestionClick={onSuggestionClick}
                                onExplain={onExplain}
                            />
                        ))

                    )}

                    {isTyping && !pendingTextRef.current && (

                        <div className="flex gap-3">

                            <div className="w-7 h-7 rounded-lg bg-surface-emphasized flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-content-deemphasized" strokeWidth={1.75} />
                            </div>

                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-emphasized flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>

                        </div>

                    )}

                </div>

            </div>

            {showScrollButton && messages.length > 0 && (

                <Fab
                    size="small"
                    onClick={() => scrollToBottom("smooth")}
                    aria-label="Scroll to latest message"
                    className="animate-fade-in-up"
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        right: "50%",
                        translate: "-50% 0",
                        bgcolor: "var(--color-surface-emphasized)",
                        color: "var(--color-content-default)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        border: "1px solid var(--color-lines-divider)",
                        "&:hover": { bgcolor: "var(--color-surface-emphasized)" },
                    }}
                >
                    <ArrowDown className="w-4 h-4" />
                </Fab>

            )}

        </div>

    );
    
}