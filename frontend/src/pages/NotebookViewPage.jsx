














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
import { useDocumentStatusPolling } from "../hooks/useDocumentStatusPolling.js";
import { useChatMessages } from "../hooks/useChatMessages.js";
import { useDocumentUpload } from "../hooks/useDocumentUpload.js";

const NotebookViewPage = () => {

    const { notebook_id } = useParams(); 
    const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"
    const inputRef = useRef(null); 

    const sidebarRef = useRef(null);

    // naya handler:
    const handleCitationClick = (citation) => {
        sidebarRef.current?.jumpToCitation(citation);
    };

    const [usage, setUsage] = useState(null); // { documents: {used,total}, questions: {used,total} }

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


    const { pageLoading, doc, setDoc, documentUrl, setDocumentUrl, title, setTitle } = useNotebookData(notebook_id);

    useDocumentStatusPolling(notebook_id, doc, setDoc, setDocumentUrl);  


    const isDocReady = doc?.status === "ready";
    const isDocProcessing = doc?.status === "processing";
    const isDocFailed = doc?.status === "failed";

    const documentsExhausted = !!usage && usage.documents.used >= usage.documents.total;
    const questionsExhausted = !!usage && usage.questions.used >= usage.questions.total;

    const { pendingFile, setPendingFile, isUploading, uploadProgress, limitModal, setLimitModal, handleUpload, handleRetryUpload } = useDocumentUpload(notebook_id, setDoc, setDocumentUrl, documentsExhausted, setUsage);

    const { messages,setMessages, input, setInput, isTyping, isChatLoading, pendingTextRef, handleSend, handleExplain } = useChatMessages(notebook_id, isDocReady, doc?.status, questionsExhausted, setUsage, setLimitModal);

    const { chatBoxRef, showScrollButton, scrollToBottom, handleChatScroll } = useAutoScroll(messages, isChatLoading);  



    const handleSuggestionClick = (q) => {
        // setInput(q);
        // setTimeout(() => inputRef.current?.focus(), 50);
        setTimeout(() => handleExplain(q), 50);
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
                        <NotebookSidebar ref={sidebarRef} doc={doc} documentUrl={documentUrl} onExplain={handleExplain} />
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

                                {
                                    isChatLoading
                                        ?
                                        <div className='flex flex-col items-center justify-center flex-1 h-full'>
                                            <div className='animate-spin absolute'>
                                                <div className='will-change-auto backface-hidden visible animate-(--my-gap-anim) grid grid-cols-2 grid-rows-2 gap-1 ' style={{ "--my-gap-anim": "gap-move 1.5s infinite" }} >
                                                    <div className='bg-primary rounded-full h-2 w-2'></div>
                                                    <div className='bg-primary/90 rounded-full h-2 w-2'></div>
                                                    <div className='bg-primary/80 rounded-full h-2 w-2'></div>
                                                    <div className='bg-primary/70 rounded-full h-2 w-2'></div>
                                                </div>
                                            </div>
                                        </div>
                                        : ( 

                                            <>

                                                <ChatMessageList
                                                    notebook_id={notebook_id}
                                                    onClearMessages={() => setMessages([])}
                                                    messages={messages} 
                                                    doc={doc} 
                                                    onSuggestionClick={handleSuggestionClick}
                                                    onExplain={handleExplain}
                                                    onCitationClick={handleCitationClick}
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

                                            </>

                                        )

                                }

                            </div>

                        )}

                    </main>

                </div>

            </div>

        </div>

    );

};

export default NotebookViewPage;