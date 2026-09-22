import { ArrowRight } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

export default function ChatInputBar({ inputRef, input, setInput, onSend, isTyping, isDocReady }) {
    return (
        <div className="relative max-w-5xl mx-auto w-full shrink-0 px-4 sm:px-6 lg:px-20 pb-5 pt-3 bg-transparent">
            <div className="absolute w-full h-7 bg-linear-to-t from-white/90 dark:from-black/90 to-transparent right-0 bottom-full" />

            <div className="relative flex items-end gap-2 rounded-[30px] bg-white dark:bg-[#1E1F20] shadow-[0_0_8px_-2px] dark:shadow-lg shadow-black/10 dark:shadow-black/20 px-4 pl-8 py-3 border border-transparent focus-within:border-lines-divider transition-all duration-200">
                <textarea
                    ref={inputRef}
                    id="chat-input"
                    rows={1}
                    value={input}
                    disabled={!isDocReady}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    placeholder={isDocReady ? "Ask a question about this document..." : "Waiting for the document to finish processing..."}
                    className="flex-1 scrollbar-thin min-w-0 resize-none my-auto bg-transparent outline-none text-base text-content-default placeholder:text-content-deemphasized leading-relaxed max-h-30 overflow-y-auto disabled:cursor-not-allowed"
                />
                <Tooltip title="Send">
                    <IconButton
                        id="send-message-btn"
                        onClick={onSend}
                        disabled={!input.trim() || isTyping || !isDocReady}
                        loading={isTyping}
                    >
                        <ArrowRight className="size-5" />
                    </IconButton>
                </Tooltip>
            </div>

            <p className="text-center text-[11px] text-content-deemphasized/70 mt-2 font-medium">
                Answers are grounded in your uploaded document · Press Enter to send
            </p>
        </div>
    );
}