














import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getMessages,
    getNotebook,
    getNotebookStatus,
    getUsage,
    sendMessageStream,
    uploadDocument
} from "../apis/notebookApi.js";

import {
    BookOpen,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

import toast from "react-hot-toast";

import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
import NotebookSidebar from "../components/notebooks/NotebookSidebar.jsx";
import { Button } from "@mui/material";
import LimitReachedModal from "../components/common/LimitReachedModal.jsx";
import NotebookHeader from "../components/notebooks/NotebookHeader.jsx";
import MobileTabSwitcher from "../components/notebooks/MobileTabSwitcher.jsx";
import ProcessingBanner from "../components/notebooks/ProcessingBanner.jsx";
import ChatMessageList from "../components/notebooks/ChatMessageList.jsx";
import ChatInputBar from "../components/notebooks/ChatInputBar.jsx";
import { useAutoScroll } from "../hooks/useAutoScroll.js";
import { useNotebookData } from "../hooks/useNotebookData.js";

const NotebookViewPage = () => {

    const pendingTextRef = useRef("");
    const flushTimeoutRef = useRef(null);
    const nextMsgIdRef = useRef(0);

    const { notebook_id } = useParams();

    const [pendingFile, setPendingFile] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"

    const inputRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const [limitModal, setLimitModal] = useState({ open: false, limitType: "documents", used: 0, total: 0 });

    // Daily usage (documents + questions). Fetched once on mount so the UI
    // can proactively disable actions and show remaining counts, instead of
    // only reacting after a request fails.
    const [usage, setUsage] = useState(null); // { documents: {used,total}, questions: {used,total} }

    const makeMsgId = () => `msg-${Date.now()}-${nextMsgIdRef.current++}`;

    const { chatBoxRef, showScrollButton, scrollToBottom, handleChatScroll } = useAutoScroll(messages);

    const { pageLoading, doc, setDoc, documentUrl, setDocumentUrl, title, setTitle } = useNotebookData(notebook_id);

    useDocumentStatusPolling(notebook_id, doc, setDoc, setDocumentUrl);


    // ── Fetch daily usage (documents + questions) ───────────────────
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await getUsage();
                if (!cancelled) setUsage(res.data);
            } catch {
                // Usage fetch fail ho to silently ignore — proactive UI bas
                // nahi dikhegi, lekin core upload/chat flow unaffected rahega
                // (reactive RATE_LIMIT_EXCEEDED handling abhi bhi kaam karegi).
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);


    // ── Load chat history once the document is ready ───────────────
    useEffect(() => {
        if (!doc || doc.status !== "ready") return;

        let cancelled = false;

        (async () => {
            try {
                const res = await getMessages(notebook_id);
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
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [notebook_id, doc?.status]);


    // ── Autoscroll on new messages ──────────────────────────────────
    // const scrollToBottom = (behavior = "auto") => {
    //     if (chatBoxRef.current) {
    //         chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior });
    //     }
    // };


    // useEffect(() => {
    //     scrollToBottom();
    // }, [messages]);


    // const handleChatScroll = () => {
    //     const el = chatBoxRef.current; 
    //     if (!el) return;
    //     const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    //     setShowScrollButton(distanceFromBottom > 200);
    // };


    // // ── Document status polling ─────────────────────────────────────
    // useEffect(() => {
    //     if (!doc || doc.status !== "processing") return;

    //     let cancelled = false;
    //     let timeoutId;
    //     let errorAttempts = 0;
    //     const MAX_ERROR_ATTEMPTS = 15;

    //     const poll = async () => {
    //         try {
    //             const res = await getNotebookStatus(notebook_id);
    //             if (cancelled) return;

    //             errorAttempts = 0;
    //             const data = res.data.data;
    //             setDoc((prev) => (prev ? { ...prev, ...data } : prev));
    //             if (data.document_url) setDocumentUrl(data.document_url);

    //             if (data.status === "processing") {
    //                 timeoutId = setTimeout(poll, 3000);
    //             } else if (data.status === "ready") {
    //                 toast.success("Document is ready — you can start asking questions!");
    //             } else if (data.status === "failed") {
    //                 toast.error(data.error_message || "Document processing failed");
    //             }
    //         } catch (err) {
    //             if (cancelled) return;
    //             errorAttempts += 1;
    //             if (errorAttempts >= MAX_ERROR_ATTEMPTS) {
    //                 toast.error("Couldn't check document status. Please refresh the page.");
    //                 return;
    //             }
    //             timeoutId = setTimeout(poll, 5000);
    //         }
    //     };

    //     timeoutId = setTimeout(poll, 3000);

    //     return () => {
    //         cancelled = true;
    //         clearTimeout(timeoutId);
    //     };
    // }, [notebook_id, doc?.status]);

    
    // ── Cleanup pending stream-flush timer on unmount ───────────────
    useEffect(() => {
        return () => {
            if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
        };
    }, []);

    const documentsExhausted = !!usage && usage.documents.used >= usage.documents.total;
    const questionsExhausted = !!usage && usage.questions.used >= usage.questions.total;

    // ── Upload ───────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!pendingFile) return;

        // Proactive check — user ko fail hone ka wait nahi karana, agar
        // already pata hai limit khatam hai.
        if (documentsExhausted) {
            setLimitModal({
                open: true,
                limitType: "documents",
                used: usage.documents.used,
                total: usage.documents.total,
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        try {
            const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
                setUploadProgress(percent);
            });

            setDoc({
                filename: res.data.data.filename,
                status: res.data.data.status, // backend se "processing" aayega
                page_count: null,
            });
            setDocumentUrl(null);
            setPendingFile(null);
            toast.success("Document uploaded");

            // Local count optimistically badhाओ — extra API round-trip nahi
            setUsage((prev) => prev && {
                ...prev,
                documents: { ...prev.documents, used: prev.documents.used + 1 },
            });
        } catch (err) {
            const errorData = err?.response?.data?.error;
            if (errorData?.code === "RATE_LIMIT_EXCEEDED") {
                setLimitModal({
                    open: true,
                    limitType: "documents",
                    used: errorData.fields?.used ?? 0,
                    total: errorData.fields?.total ?? 0,
                });
            } else {
                toast.error(errorData?.message || "Upload failed");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetryUpload = () => {
        setDoc(null);
        setDocumentUrl(null);
        setPendingFile(null);
    };

    const handleSuggestionClick = (q) => {
        setInput(q);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const isDocReady = doc?.status === "ready";
    const isDocProcessing = doc?.status === "processing";
    const isDocFailed = doc?.status === "failed";

    // Removes a trailing empty assistant placeholder bubble left behind after an error
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

        // Proactive block — user ko chahiye ki usse PEHLE pata chal jaye
        // ki limit khatam hai, request fail hone ka wait na karna pade.
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

        const userMsgId = makeMsgId();
        setMessages((prev) => [...prev, { id: userMsgId, role: "user", text: questionText }]);
        setIsTyping(true);
        setMessages((prev) => [...prev, { id: makeMsgId(), role: "assistant", text: "", citations: [] }]);

        // Rate-limit (ya koi bhi hard-fail jahan koi answer generate hi
        // nahi hua) hone par is poore turn ko undo karo — user ka bubble
        // bhi hataओ (pehle sirf empty assistant bubble hataता tha, user
        // ka sawal "bina jawab" atका reh jata tha), aur uska typed text
        // wapas input me daal do taaki lost na ho.
        const undoOptimisticTurn = () => {
            setMessages((prev) =>
                prev.filter((m) => m.id !== userMsgId && !(m.role === "assistant" && !m.text))
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
            await sendMessageStream(notebook_id, questionText, {
                onCitations: (citations) => {
                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { ...updated[updated.length - 1], citations };
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
                onDone: () => {
                    if (flushTimeoutRef.current) {
                        clearTimeout(flushTimeoutRef.current);
                        flushTimeoutRef.current = null;
                    }
                    if (pendingTextRef.current) {
                        const chunk = pendingTextRef.current;
                        pendingTextRef.current = "";
                        setMessages((prev) => {
                            const updated = [...prev];
                            const last = updated[updated.length - 1];
                            updated[updated.length - 1] = { ...last, text: last.text + chunk };
                            return updated;
                        });
                    }
                    setIsTyping(false);

                    // Successful turn — local question count badhाओ
                    setUsage((prev) => prev && {
                        ...prev,
                        questions: { ...prev.questions, used: prev.questions.used + 1 },
                    });
                },
                // sendMessageStream ab dusra argument (errorObj) bhi deta hai,
                // jisme backend ka { code, fields } hota hai — pehle sirf
                // message string aata tha, isliye RATE_LIMIT_EXCEEDED ko
                // specifically detect karna possible hi nahi tha.
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

    const handleSend = () => {
        submitQuestion(input);
    };

    // Explain button ke liye naya handler
    const handleExplain = (selectedText) => {
        submitQuestion(selectedText);
    };

    if (pageLoading) {
        return (
            <div className="h-screen w-full bg-surface-default flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-emphasized flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-content-deemphasized" strokeWidth={1.75} />
                </div>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-content-deemphasized/25 border-t-primary" />
            </div>
        );
    }

    return (

        <div className="h-screen w-full flex flex-col bg-surface-default overflow-hidden">

            <LimitReachedModal
                open={limitModal.open}
                onClose={() => setLimitModal((prev) => ({ ...prev, open: false }))}
                limitType={limitModal.limitType}
                used={limitModal.used}
                total={limitModal.total}
            />

            <NotebookHeader title={title} setTitle={setTitle} notebook_id={notebook_id} />

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                <MobileTabSwitcher setMobileTab={setMobileTab} mobileTab={mobileTab} />

                <div className="relative flex flex-1 overflow-hidden">

                    <div className={`absolute inset-0 md:static md:flex overflow-hidden transition-transform duration-300 ease-out ${mobileTab === 'sources' ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                        <NotebookSidebar doc={doc} documentUrl={documentUrl} onExplain={handleExplain} />
                    </div>

                    <main className={`absolute inset-0 md:static md:flex md:flex-1 flex-col min-w-0 overflow-hidden transition-transform duration-300 ease-out ${mobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>

                        {!doc ? (

                            <UploadPrompt
                                pendingFile={pendingFile}
                                setPendingFile={setPendingFile}
                                uploading={isUploading}
                                progress={uploadProgress}
                                handleUpload={handleUpload}
                                documentsExhausted={documentsExhausted}
                                documentsRemaining={usage ? usage.documents.total - usage.documents.used : null}
                            />

                        ) : isDocFailed ? (

                            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">

                                <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-danger" strokeWidth={1.75} />
                                </div>

                                <div className="space-y-1 max-w-sm">
                                    <h3 className="text-[15px] font-semibold text-content-default">Processing failed</h3>
                                    <p className="text-[13px] text-content-deemphasized leading-relaxed">
                                        {doc.error_message || "We couldn't process this document. Try uploading it again."}
                                    </p>
                                </div>

                                <Button
                                    variant="text"
                                    onClick={handleRetryUpload}
                                    startIcon={<RefreshCw className="w-3.5 h-3.5" />}
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 500,
                                        color: "var(--color-primary)",
                                    }}
                                >
                                    Upload again
                                </Button>

                            </div>

                        ) : (

                            <div className="flex-1 flex flex-col w-full overflow-hidden">

                                {isDocProcessing && (
                                    <ProcessingBanner />
                                )}

                                <ChatMessageList
                                    messages={messages}
                                    docFilename={doc.filename}
                                    onSuggestionClick={handleSuggestionClick}
                                    onExplain={handleExplain}
                                    isTyping={isTyping}
                                    pendingTextRef={pendingTextRef}
                                    chatBoxRef={chatBoxRef}
                                    handleChatScroll={handleChatScroll}
                                    showScrollButton={showScrollButton}
                                    scrollToBottom={scrollToBottom}
                                />

                                <ChatInputBar
                                    inputRef={inputRef}
                                    input={input}
                                    setInput={setInput}
                                    onSend={handleSend}
                                    isTyping={isTyping}
                                    isDocReady={isDocReady}
                                    questionsExhausted={questionsExhausted}
                                    questionsRemaining={usage ? usage.questions.total - usage.questions.used : null}
                                />

                            </div>

                        )}

                    </main>

                </div>

            </div>

        </div>

    );

};

export default NotebookViewPage;