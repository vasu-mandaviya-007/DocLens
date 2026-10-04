import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getMessages, sendMessageStream } from "../apis/notebookApi.js";

export function useChatMessages(notebookId, isDocReady, docStatus, questionsExhausted, setUsage, setLimitModal) {

    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(true);

    const pendingTextRef = useRef("");
    const flushTimeoutRef = useRef(null);
    const nextMsgIdRef = useRef(0);

    const makeMsgId = () => `msg-${Date.now()}-${nextMsgIdRef.current++}`;


    // Chat history load — sirf ek baar jab document "ready" ho
    useEffect(() => {
        if (docStatus !== "ready") return;

        let cancelled = false;

        (async () => {
            setIsChatLoading(true);
            try {
                const res = await getMessages(notebookId);
                if (!cancelled) {
                    setMessages(
                        res.data.data.map((m) => ({
                            id: makeMsgId(),
                            role: m.role,
                            text: m.text,
                            citations: m.citations,
                        }))
                    );
                }
            } catch (err) {
                if (!cancelled) toast.error("Could not load previous messages");
            } finally {
                if (!cancelled) setIsChatLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [notebookId, docStatus]);


    // Pending stream-flush timer ko unmount pe cleanup karo
    useEffect(() => {
        return () => {
            if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
        };
    }, []);


    const dropTrailingEmptyAssistant = () => {
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.text) {
                return prev.slice(0, -1);
            }
            return prev;
        });
    };


    const submitQuestion = async (questionText) => {

        if (!questionText.trim() || isTyping || !isDocReady) return;

        if (questionsExhausted) {
            setLimitModal({
                open: true,
                limitType: "questions",
                used: usage.questions.used,
                total: usage.questions.total,
            });
            return;
        }

        setInput("");
        setMessages((prev) => [...prev, { id: makeMsgId(), role: "user", text: questionText }]);
        setIsTyping(true);
        setMessages((prev) => [...prev, { id: makeMsgId(), role: "assistant", text: "", citations: [] }]);


        const undoOptimisticTurn = () => {
            setMessages((prev) =>
                prev.filter((m) => m.id !== makeMsgId() && !(m.role === "assistant" && !m.text))
            );
            setInput(questionText);
        };

        let hasFirstToken = false;

        const scheduleFlush = () => {
            if (flushTimeoutRef.current) return;
            flushTimeoutRef.current = setTimeout(() => {
                flushTimeoutRef.current = null;
                const chunk = pendingTextRef.current;
                pendingTextRef.current = "";
                if (chunk) {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = { ...last, text: last.text + chunk };
                        return updated;
                    });
                }
            }, 40);
        };

        try {
            await sendMessageStream(notebookId, questionText, {
                // onCitations: (citations) => {
                //     setMessages((prev) => {
                //         const updated = [...prev];
                //         updated[updated.length - 1] = { ...updated[updated.length - 1], citations };
                //         return updated;
                //     });
                // },
                onCitations: (sources) => {
                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { ...updated[updated.length - 1], sources };
                        return updated;
                    });
                },
                onToken: (token) => {
                    if (!hasFirstToken) {
                        hasFirstToken = true;
                        setIsTyping(false);
                    }
                    pendingTextRef.current += token;
                    scheduleFlush();
                },
                onReset: () => {
                    if (flushTimeoutRef.current) {
                        clearTimeout(flushTimeoutRef.current);
                        flushTimeoutRef.current = null;
                    }
                    pendingTextRef.current = "";
                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = { ...last, text: "" };
                        return updated;
                    });
                },
                // onDone: () => {
                //     if (flushTimeoutRef.current) {
                //         clearTimeout(flushTimeoutRef.current);
                //         flushTimeoutRef.current = null;
                //     }
                //     if (pendingTextRef.current) {
                //         const chunk = pendingTextRef.current;
                //         pendingTextRef.current = "";
                //         setMessages((prev) => {
                //             const updated = [...prev];
                //             const last = updated[updated.length - 1];
                //             updated[updated.length - 1] = { ...last, text: last.text + chunk };
                //             return updated;
                //         });
                //     }
                //     setIsTyping(false);

                //     setUsage((prev) => prev && {
                //         ...prev,
                //         questions: { ...prev.questions, used: prev.questions.used + 1 },
                //     });

                // },
                onDone: (data) => {
                    if (flushTimeoutRef.current) {
                        clearTimeout(flushTimeoutRef.current);
                        flushTimeoutRef.current = null;
                    }
                    pendingTextRef.current = "";

                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = {
                            ...last,
                            text: data.answer,          // normalized [1][3] wala final text
                            citations: data.citations,  // sirf use hue sources
                            sources: undefined,         // early list ab nahi chahiye
                        };
                        return updated;
                    });
                    setIsTyping(false);

                    setUsage((prev) => prev && {
                        ...prev,
                        questions: { ...prev.questions, used: prev.questions.used + 1 },
                    });
                },
                onError: (msg, errorObj) => {
                    setIsTyping(false);

                    if (errorObj?.code === "RATE_LIMIT_EXCEEDED") {
                        undoOptimisticTurn();
                        setLimitModal({
                            open: true,
                            limitType: "questions",
                            used: errorObj.fields?.used ?? usage?.questions.used ?? 0,
                            total: errorObj.fields?.total ?? usage?.questions.total ?? 0,
                        });
                        return;
                    }

                    toast.error(msg || "Failed to get response");
                    dropTrailingEmptyAssistant();
                },
            });

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
            setIsTyping(false);
            dropTrailingEmptyAssistant();
        }

    };

    return {
        messages,
        setMessages,
        input,
        setInput,
        isChatLoading,
        isTyping,
        pendingTextRef,
        handleSend: () => submitQuestion(input),
        handleExplain: (selectedText) => submitQuestion(selectedText),
    };
}