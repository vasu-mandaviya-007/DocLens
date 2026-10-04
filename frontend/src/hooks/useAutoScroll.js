import { useRef, useState, useEffect } from "react";

export function useAutoScroll(messages, isChatLoading) {
    const chatBoxRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = (behavior = "auto") => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior });
        }
    };

    useEffect(() => {
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [messages, isChatLoading]);

    const handleChatScroll = () => {
        const el = chatBoxRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 200);
    };

    return { chatBoxRef, showScrollButton, scrollToBottom, handleChatScroll };
}