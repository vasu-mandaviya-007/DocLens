
// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import { getMessages, getNotebook, getNotebookStatus, renameNotebook, sendMessage, sendMessageStream, uploadDocument } from "../apis/notebookApi.js";
// import { ArrowLeft, BookOpen, Pencil, Loader2, FileText, MessageSquare, Send, Sparkles, ArrowUp, ArrowUpWideNarrow } from "lucide-react";
// import toast from "react-hot-toast";

// import ThemeToggle from "../components/ThemeToggle.jsx";
// import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
// import NotebookSidebar from "../components/notebooks/NotebookSidebar.jsx";
// import ChatEmptyState from "../components/notebooks/ChatEmptyState.jsx";
// import ChatBubble from "../components/notebooks/ChatBubble.jsx";
// import LimitReachedModal from "../components/LimitReachedModal.jsx";

// import { Button } from "@mui/material";


// const NotebookViewPage = () => {

//     const pendingTextRef = useRef("");
//     const flushTimeoutRef = useRef(null);
//     const chatBoxRef = useRef(null);

//     const sidebarRef = useRef(null);

//     const { notebook_id } = useParams();
//     const navigate = useNavigate();

//     const [pageLoading, setPageLoading] = useState(true);
//     const [pendingFile, setPendingFile] = useState(null);
//     const [document, setDocument] = useState(null);
//     const [documentUrl, setDocumentUrl] = useState(null);

//     const [title, setTitle] = useState(null);
//     const [isEditingTitle, setIsEditingTitle] = useState(false);
//     const [titleDraft, setTitleDraft] = useState("");
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);

//     const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"

//     const titleInputRef = useRef(null);
//     const inputRef = useRef(null);

//     // const [question, setQuestion] = useState("")
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState("One liner Definition of machine learning")
//     const [isTyping, setIsTyping] = useState(false);
//     const chatEndRef = useRef(null);



//     const fetchNotebook = async () => {
//         setPageLoading(true);
//         try {
//             const response = await getNotebook(notebook_id);
//             const doc = response.data.data.document;
//             if (doc?.document_url) setDocumentUrl(doc.document_url);
//             setDocument(doc);
//             setTitle(response.data.data.title);
//         } catch (err) {
//             if (err?.response?.status === 404) {
//                 toast.error("Notebook not found");
//                 navigate("/", { replace: true });
//             } else {
//                 toast.error("Could not load notebook");
//             }
//         } finally {
//             setPageLoading(false);
//         }
//     };


//     useEffect(() => {
//         fetchNotebook();
//     }, [notebook_id]);



//     useEffect(() => {

//         if (!document || document.status !== "ready") return;

//         let cancelled = false;

//         (async () => {

//             try {

//                 const res = await getMessages(notebook_id);
//                 console.log(res);

//                 if (!cancelled) {
//                     setMessages(res.data.data.map((m) => ({ role: m.role, text: m.text, citations: m.citations })));
//                 }

//             } catch (err) {

//             }

//         })();
//         return () => { cancelled = true; }

//     }, [notebook_id, document?.status]);


//     useEffect(() => {

//         if (chatBoxRef.current) {
//             chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight })
//         }

//     }, [chatBoxRef, messages])


//     useEffect(() => {
//         if (isEditingTitle && titleInputRef.current) {
//             titleInputRef.current.focus();
//             titleInputRef.current.select();
//         }
//     }, [isEditingTitle]);



//     useEffect(() => {

//         if (!document || document.status !== "processing") return;

//         let cancelled = false;
//         let timeoutId;

//         const poll = async () => {

//             try {
//                 const res = await getNotebookStatus(notebook_id);

//                 if (cancelled) return;

//                 const data = res.data.data;

//                 setDocument((prev) => (prev ? { ...prev, ...data } : prev))

//                 if (data.status === "processing") {
//                     timeoutId = setTimeout(poll, 3000);
//                 } else if (latest.status === "ready") {
//                     toast.success("Document is ready — you can start asking questions!");
//                 } else if (latest.status === "failed") {
//                     toast.error(latest.error_message || "Document processing failed");
//                 }

//             } catch (err) {
//                 console.log(err);
//                 if (!cancelled) timeoutId = setTimeout(poll, 5000);
//             }

//         }

//         timeoutId = setTimeout(poll, 3000);

//         return () => {
//             cancelled = true;
//             clearTimeout(timeoutId);
//         }

//     }, [notebook_id, document?.status]);



//     const handleTitleKeyDown = (e) => {
//         if (e.key === "Enter") {
//             e.target.blur();
//         } else if (e.key === "Escape") {
//             setTitleDraft(title);
//             setIsEditingTitle(false);
//         }
//     };



//     const handleSaveTitle = async () => {
//         const trimmed = titleDraft.trim();
//         setIsEditingTitle(false);

//         if (!trimmed || trimmed === title) {
//             setTitleDraft(title);
//             return;
//         }

//         const previousTitle = title;
//         setTitle(trimmed);
//         try {
//             await renameNotebook(notebook_id, trimmed);
//             toast.success("Title updated");
//         } catch {
//             setTitle(previousTitle);
//             toast.error("Could not update title");
//         }
//     };


//     const [limitModal, setLimitModal] = useState({ open: false, limitType: "documents", used: 0, total: 0 });

//     const handleUpload = async () => {
//         if (!pendingFile) return;

//         setIsUploading(true);
//         setUploadProgress(0);
//         try {
//             const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
//                 setUploadProgress(percent);
//             });

//             setDocument({
//                 filename: res.data.data.filename,
//                 status: res.data.data.status, // backend se "processing" aayega
//                 page_count: null,
//             });
//             setPendingFile(null);
//             toast.success("Document uploaded");
//         } catch (err) {
//             const errorData = err?.response?.data?.error;
//             if (errorData?.code === "RATE_LIMIT_EXCEEDED") {
//                 setLimitModal({
//                     open: true,
//                     limitType: "documents",
//                     used: errorData.fields?.used ?? 3,
//                     total: errorData.fields?.total ?? 3,
//                 });
//             } else {
//                 toast.error(errorData?.message || "Upload failed");
//             }
//         } finally {
//             setIsUploading(false);
//         }
//     };


//     // const handleUpload = async () => {
//     //     if (!pendingFile) return;

//     //     setIsUploading(true);
//     //     setUploadProgress(0);
//     //     try {
//     //         const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
//     //             setUploadProgress(percent);
//     //         });

//     //         setDocument({
//     //             filename: res.data.data.filename, 
//     //             status: res.data.data.status, // backend se "processing" aayega
//     //             page_count: null,
//     //         });
//     //         setPendingFile(null);
//     //         toast.success("Document uploaded");
//     //     } catch (err) {            
//     //         toast.error(err?.response?.data?.error?.message || err?.response?.data?.detail || "Upload failed");
//     //     } finally {
//     //         setIsUploading(false);
//     //     }
//     // };

//     const handleSuggestionClick = (q) => {
//         setInput(q);
//         setTimeout(() => inputRef.current?.focus(), 50);
//     };

//     if (pageLoading) {
//         return (
//             <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-xl shadow-brand-primary/30 animate-pulse">
//                     <BookOpen className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="flex flex-col items-center gap-1">
//                     <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
//                     <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium tracking-wide uppercase">
//                         Loading notebook...
//                     </p>
//                 </div>
//             </div>
//         );
//     }


//     const handleSend = async () => {
//         if (!input.trim() || isTyping) return;

//         const questionText = input;
//         setMessages((prev) => [...prev, { role: "user", text: questionText }]);
//         // setInput("");
//         setIsTyping(true);

//         setMessages((prev) => [...prev, { role: "assistant", text: "", citations: [] }]);

//         let hasFirstToken = false;

//         const scheduleFlush = () => {
//             if (flushTimeoutRef.current) return;
//             flushTimeoutRef.current = setTimeout(() => {
//                 flushTimeoutRef.current = null;
//                 const chunk = pendingTextRef.current;
//                 pendingTextRef.current = "";
//                 if (chunk) {
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         const last = updated[updated.length - 1];
//                         updated[updated.length - 1] = { ...last, text: last.text + chunk };
//                         return updated;
//                     });
//                 }
//             }, 40);
//         };

//         try {
//             await sendMessageStream(notebook_id, questionText, {
//                 onCitations: (citations) => {
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         updated[updated.length - 1] = { ...updated[updated.length - 1], citations };
//                         return updated;
//                     });
//                 },
//                 onToken: (token) => {
//                     if (!hasFirstToken) {
//                         hasFirstToken = true;
//                         setIsTyping(false);
//                     }
//                     pendingTextRef.current += token;
//                     scheduleFlush();
//                 },

//                 // Real bug fix (unrelated to follow-ups): if Groq streamed some
//                 // partial text and then a rate limit forces a Gemini fallback,
//                 // the old partial text and new Gemini text would otherwise get
//                 // concatenated into one garbled message. This clears it first.
//                 onReset: () => {
//                     if (flushTimeoutRef.current) {
//                         clearTimeout(flushTimeoutRef.current);
//                         flushTimeoutRef.current = null;
//                     }
//                     pendingTextRef.current = "";
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         const last = updated[updated.length - 1];
//                         updated[updated.length - 1] = { ...last, text: "" };
//                         return updated;
//                     });
//                 },

//                 onDone: () => {
//                     if (flushTimeoutRef.current) {
//                         clearTimeout(flushTimeoutRef.current);
//                         flushTimeoutRef.current = null;
//                     }
//                     if (pendingTextRef.current) {
//                         const chunk = pendingTextRef.current;
//                         pendingTextRef.current = "";
//                         setMessages((prev) => {
//                             const updated = [...prev];
//                             const last = updated[updated.length - 1];
//                             updated[updated.length - 1] = { ...last, text: last.text + chunk };
//                             return updated;
//                         });
//                     }
//                     setIsTyping(false);
//                 },
//                 onError: (msg) => {
//                     toast.error(msg || "Failed to get response");
//                     setIsTyping(false);
//                 },
//             });
//         } catch (err) {
//             console.error(err);
//             toast.error("Something went wrong");
//             setIsTyping(false);
//         }
//     };

//     return (

//         <div className="h-screen w-full flex flex-col bg-surface-default overflow-hidden">

//             <LimitReachedModal
//                 open={limitModal.open}
//                 onClose={() => setLimitModal((prev) => ({ ...prev, open: false }))}
//                 limitType={limitModal.limitType}
//                 used={limitModal.used}
//                 total={limitModal.total}
//             />

//             <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-16 border-b border-b-lines-divider bg-sidebar-fill shrink-0 z-20">

//                 <div className="flex items-stretch gap-2 sm:gap-3 shrink-0">

//                     <Link
//                         to="/"
//                         className="group flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 text-xs font-medium"
//                         title="Back to notebooks"
//                     >
//                         <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
//                         <span className="hidden sm:inline">Notebooks</span>
//                     </Link>

//                     <div className="w-px h-6 my-auto bg-zinc-200 dark:bg-zinc-800 shrink-0" />

//                     <div className="w-8 h-8 rounded-md bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm shadow-brand-primary/30 shrink-0">
//                         <BookOpen className="w-4.5 h-4.5 text-white" />
//                     </div>

//                 </div>

//                 <div className="flex-1 min-w-0 flex items-center p-2">
//                     {isEditingTitle ? (
//                         <div className="flex items-center gap-1.5 w-full max-w-md">
//                             <input
//                                 ref={titleInputRef}
//                                 value={titleDraft}
//                                 onChange={(e) => setTitleDraft(e.target.value)}
//                                 onKeyDown={handleTitleKeyDown}
//                                 onBlur={handleSaveTitle}
//                                 className="flex-1 min-w-0 text-lg sm:text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 outline outline-brand-primary/60 rounded-sm px-2.5 py-1 text-zinc-900 dark:text-zinc-100"
//                                 placeholder="Notebook title..."
//                             />
//                         </div>
//                     ) : (
//                         <button
//                             onClick={() => { setIsEditingTitle(true); setTitleDraft(title); }}
//                             title="Click to rename"
//                             className="group flex items-center gap-2 min-w-0 max-w-full sm:max-w-sm text-left"
//                         >
//                             <span className="text-lg sm:text-xl font-medium text-content-default truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
//                                 {title}
//                             </span>
//                             <span className="shrink-0 hidden sm:flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 duration-300 transition-opacity">
//                                 <Pencil className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
//                             </span>
//                         </button>
//                     )}
//                 </div>

//                 <ThemeToggle />

//             </header>

//             <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

//                 <div className="md:hidden flex items-center gap-1 p-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">

//                     <button
//                         onClick={() => setMobileTab("sources")}
//                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "sources"
//                             ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                             : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                             }`}
//                     >
//                         <FileText className="w-4 h-4" />
//                         Sources
//                     </button>

//                     <button
//                         onClick={() => setMobileTab("chat")}
//                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "chat"
//                             ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                             : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                             }`}
//                     >
//                         <MessageSquare className="w-4 h-4" />
//                         Chat
//                     </button>

//                 </div>

//                 <div className="relative flex flex-1 overflow-hidden">

//                     <div className={`absolute inset-0 md:static md:flex overflow-hidden transition-transform duration-300 ease-in-out ${mobileTab === 'sources' ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} >

//                         <NotebookSidebar document={document} documentUrl={documentUrl} />

//                     </div>

//                     {/* <div onMouseDown={startResizing} className="w-1 cursor-col-resize border-dotted border-2 border-black/70 dark:border-white/70"></div> */}

//                     <main className={`absolute inset-0 md:static md:flex md:flex-1 flex-col min-w-0 overflow-hidden transition-transform duration-300 ease-in-out ${mobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`} >

//                         {!document ? (
//                             <UploadPrompt
//                                 pendingFile={pendingFile}
//                                 setPendingFile={setPendingFile}
//                                 uploading={isUploading}
//                                 progress={uploadProgress}
//                                 handleUpload={handleUpload}
//                             />

//                         ) : (

//                             <div className="flex-1 flex flex-col w-full overflow-hidden">

//                                 <div ref={chatBoxRef} onScroll={() => console.log(`offset height : ${chatBoxRef.current.height} , scroll height ${chatBoxRef.current.scrollHeight} `)} className="flex-1 relative overflow-y-auto">

//                                     <Button
//                                         onClick={(e) => chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" })}
//                                         variant="contained"
//                                         size="small"
//                                         sx={{
//                                             position: "fixed",
//                                             bottom: 0,
//                                             aspectRatio: "1/1",
//                                             zIndex: 9999,
//                                             right: 0
//                                         }}
//                                     >
//                                         <ArrowUp />
//                                     </Button>

//                                     <div className="max-w-250 mx-auto px-4 sm:px-6 py-6 space-y-4">
//                                         {messages.length === 0 ? (
//                                             <ChatEmptyState
//                                                 docName={document.filename}
//                                                 onSuggestionClick={handleSuggestionClick}
//                                             />
//                                         ) : (
//                                             messages.map((m, i) => (
//                                                 <ChatBubble key={i} message={m} index={i} onSuggestionClick={handleSuggestionClick} />
//                                             ))
//                                             // messages.map((m, i) => (
//                                             //     <ChatBubble key={i} message={m} index={i} />
//                                             // )) 
//                                         )}

//                                         {(isTyping && !pendingTextRef.current) && (
//                                             <div className="flex gap-3">
//                                                 <div className="w-8 h-8 rounded-xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-brand-primary/20">
//                                                     <Sparkles className="w-4 h-4 text-white" />
//                                                 </div>
//                                                 <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/60 shadow-sm flex items-center gap-1.5">
//                                                     <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "0ms" }} />
//                                                     <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "150ms" }} />
//                                                     <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "300ms" }} />
//                                                 </div>
//                                             </div>
//                                         )}

//                                         <div ref={chatEndRef} />
//                                     </div>

//                                 </div>

//                                 <div className="shrink-0 px-4 sm:px-6 lg:px-10 pb-5 pt-3 bg-linear-to-t from-zinc-50 dark:from-zinc-950 to-transparent">

//                                     <div className="relative flex items-end gap-2 rounded-xl border-2 border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-900/5 dark:shadow-black/20 px-4 py-3 focus-within:border-brand-primary/50 dark:focus-within:border-brand-primary/40 transition-all duration-200">

//                                         <textarea
//                                             ref={inputRef}
//                                             id="chat-input"
//                                             rows={1}
//                                             value={input}
//                                             onChange={(e) => {
//                                                 setInput(e.target.value);
//                                                 e.target.style.height = "auto";
//                                                 e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
//                                             }}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === "Enter" && !e.shiftKey) {
//                                                     e.preventDefault();
//                                                     handleSend();
//                                                 }
//                                             }}
//                                             placeholder="Ask a question about this document..."
//                                             className="flex-1 scrollbar-thin min-w-0 resize-none my-auto bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed max-h-30 overflow-y-auto"
//                                             style={{ height: "24px" }}
//                                         />
//                                         <button
//                                             id="send-message-btn"
//                                             // onClick={handleSend}
//                                             disabled={!input.trim() || isTyping}
//                                             aria-label="Send message"
//                                             className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 self-end ${input.trim() && !isTyping
//                                                 ? "bg-linear-to-br from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-md shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5"
//                                                 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed!"
//                                                 }`}
//                                         >
//                                             {isTyping
//                                                 ? <Loader2 className="w-4 h-4 animate-spin" />
//                                                 : <Send className="w-4 h-4" />
//                                             }
//                                         </button>
//                                     </div>
//                                     <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 mt-2 font-medium">
//                                         Answers are grounded in your uploaded document · Press Enter to send
//                                     </p>
//                                 </div>

//                             </div>

//                         )}

//                     </main> 

//                 </div>

//             </div>

//         </div>
//     );
// };

// export default NotebookViewPage;




// ================================================================================
// CLAUDE 
// ================================================================================


// import { useEffect, useRef, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import {
//     getMessages,
//     getNotebook,
//     getNotebookStatus,
//     renameNotebook,
//     sendMessageStream,
//     uploadDocument,
// } from "../apis/notebookApi.js";
// import {
//     ArrowLeft,
//     BookOpen,
//     Pencil,
//     Loader2,
//     MessageSquare,
//     Send,
//     Sparkles,
//     ArrowDown,
//     AlertTriangle,
//     RefreshCw,
//     Clock,
//     ArrowRight,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import ThemeToggle from "../components/ThemeToggle.jsx";
// import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
// import NotebookSidebar from "../components/notebooks/NotebookSidebar.jsx";
// import ChatEmptyState from "../components/notebooks/ChatEmptyState.jsx";
// import ChatBubble from "../components/notebooks/ChatBubble.jsx";
// import { Button, Fab, IconButton, Tooltip } from "@mui/material";
// import LimitReachedModal from "../components/LimitReachedModal.jsx";

// const NotebookViewPage = () => {
//     const pendingTextRef = useRef("");
//     const flushTimeoutRef = useRef(null);
//     const chatBoxRef = useRef(null);
//     const nextMsgIdRef = useRef(0);

//     const { notebook_id } = useParams();
//     const navigate = useNavigate();

//     const [pageLoading, setPageLoading] = useState(true);
//     const [pendingFile, setPendingFile] = useState(null);
//     const [doc, setDoc] = useState(null); // renamed from "document" - was shadowing window.document
//     const [documentUrl, setDocumentUrl] = useState(null);

//     const [title, setTitle] = useState(null);
//     const [isEditingTitle, setIsEditingTitle] = useState(false);
//     const [titleDraft, setTitleDraft] = useState("");
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);

//     const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"

//     const titleInputRef = useRef(null);
//     const inputRef = useRef(null);

//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState("");
//     const [isTyping, setIsTyping] = useState(false);
//     const [showScrollButton, setShowScrollButton] = useState(false);

//     const [limitModal, setLimitModal] = useState({ open: false, limitType: "documents", used: 0, total: 0 });

//     const makeMsgId = () => `msg-${Date.now()}-${nextMsgIdRef.current++}`;

//     // ── Fetch notebook ──────────────────────────────────────────────
//     useEffect(() => {
//         let cancelled = false;

//         (async () => {
//             setPageLoading(true);
//             try {
//                 const response = await getNotebook(notebook_id);
//                 if (cancelled) return;
//                 const docData = response.data.data.document;
//                 if (docData?.document_url) setDocumentUrl(docData.document_url);
//                 setDoc(docData);
//                 setTitle(response.data.data.title);
//             } catch (err) {
//                 if (cancelled) return;
//                 if (err?.response?.status === 404) {
//                     toast.error("Notebook not found");
//                     navigate("/", { replace: true });
//                 } else {
//                     toast.error("Could not load notebook");
//                 }
//             } finally {
//                 if (!cancelled) setPageLoading(false);
//             }
//         })();

//         return () => {
//             cancelled = true;
//         };
//     }, [notebook_id]);

//     // ── Load chat history once the document is ready ───────────────
//     useEffect(() => {
//         if (!doc || doc.status !== "ready") return;

//         let cancelled = false;

//         (async () => {
//             try {
//                 const res = await getMessages(notebook_id);
//                 if (!cancelled) {
//                     setMessages(
//                         res.data.data.map((m) => ({
//                             id: makeMsgId(),
//                             role: m.role,
//                             text: m.text,
//                             citations: m.citations,
//                         }))
//                     );
//                 }
//             } catch (err) {
//                 if (!cancelled) toast.error("Could not load previous messages");
//             }
//         })();

//         return () => {
//             cancelled = true;
//         };
//     }, [notebook_id, doc?.status]);

//     // ── Autoscroll on new messages ──────────────────────────────────
//     const scrollToBottom = (behavior = "auto") => {
//         if (chatBoxRef.current) {
//             chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior });
//         }
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     const handleChatScroll = () => {
//         const el = chatBoxRef.current;
//         if (!el) return;
//         const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
//         setShowScrollButton(distanceFromBottom > 200);
//     };

//     // ── Title editing ────────────────────────────────────────────────
//     useEffect(() => {
//         if (isEditingTitle && titleInputRef.current) {
//             titleInputRef.current.focus();
//             titleInputRef.current.select();
//         }
//     }, [isEditingTitle]);

//     const handleTitleKeyDown = (e) => {
//         if (e.key === "Enter") {
//             e.target.blur();
//         } else if (e.key === "Escape") {
//             setTitleDraft(title);
//             setIsEditingTitle(false);
//         }
//     };

//     const handleSaveTitle = async () => {
//         const trimmed = titleDraft.trim();
//         setIsEditingTitle(false);

//         if (!trimmed || trimmed === title) {
//             setTitleDraft(title);
//             return;
//         }

//         const previousTitle = title;
//         setTitle(trimmed);
//         try {
//             await renameNotebook(notebook_id, trimmed);
//             toast.success("Title updated");
//         } catch {
//             setTitle(previousTitle);
//             toast.error("Could not update title");
//         }
//     };

//     // ── Document status polling ─────────────────────────────────────
//     useEffect(() => {
//         if (!doc || doc.status !== "processing") return;

//         let cancelled = false;
//         let timeoutId;
//         let errorAttempts = 0;
//         const MAX_ERROR_ATTEMPTS = 15;

//         const poll = async () => {
//             try {
//                 const res = await getNotebookStatus(notebook_id);
//                 if (cancelled) return;

//                 errorAttempts = 0;
//                 const data = res.data.data;
//                 setDoc((prev) => (prev ? { ...prev, ...data } : prev));
//                 if (data.document_url) setDocumentUrl(data.document_url);

//                 if (data.status === "processing") {
//                     timeoutId = setTimeout(poll, 3000);
//                 } else if (data.status === "ready") {
//                     toast.success("Document is ready — you can start asking questions!");
//                 } else if (data.status === "failed") {
//                     toast.error(data.error_message || "Document processing failed");
//                 }
//             } catch (err) {
//                 if (cancelled) return;
//                 errorAttempts += 1;
//                 if (errorAttempts >= MAX_ERROR_ATTEMPTS) {
//                     toast.error("Couldn't check document status. Please refresh the page.");
//                     return;
//                 }
//                 timeoutId = setTimeout(poll, 5000);
//             }
//         };

//         timeoutId = setTimeout(poll, 3000);

//         return () => {
//             cancelled = true;
//             clearTimeout(timeoutId);
//         };
//     }, [notebook_id, doc?.status]);

//     // ── Cleanup pending stream-flush timer on unmount ───────────────
//     useEffect(() => {
//         return () => {
//             if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
//         };
//     }, []);

//     // ── Upload ───────────────────────────────────────────────────────
//     const handleUpload = async () => {
//         if (!pendingFile) return;

//         setIsUploading(true);
//         setUploadProgress(0);
//         try {
//             const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
//                 setUploadProgress(percent);
//             });

//             setDoc({
//                 filename: res.data.data.filename,
//                 status: res.data.data.status, // backend se "processing" aayega
//                 page_count: null,
//             });
//             setDocumentUrl(null);
//             setPendingFile(null);
//             toast.success("Document uploaded");
//         } catch (err) {
//             const errorData = err?.response?.data?.error;
//             if (errorData?.code === "RATE_LIMIT_EXCEEDED") {
//                 setLimitModal({
//                     open: true,
//                     limitType: "documents",
//                     used: errorData.fields?.used ?? 0,
//                     total: errorData.fields?.total ?? 0,
//                 });
//             } else {
//                 toast.error(errorData?.message || "Upload failed");
//             }
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const handleRetryUpload = () => {
//         setDoc(null);
//         setDocumentUrl(null);
//         setPendingFile(null);
//     };

//     const handleSuggestionClick = (q) => {
//         setInput(q);
//         setTimeout(() => inputRef.current?.focus(), 50);
//     };

//     const isDocReady = doc?.status === "ready";
//     const isDocProcessing = doc?.status === "processing";
//     const isDocFailed = doc?.status === "failed";

//     // Removes a trailing empty assistant placeholder bubble left behind after an error
//     const dropTrailingEmptyAssistant = () => {
//         setMessages((prev) => {
//             const last = prev[prev.length - 1];
//             if (last && last.role === "assistant" && !last.text) {
//                 return prev.slice(0, -1);
//             }
//             return prev;
//         });
//     };

//     const handleSend = async () => {
//         if (!input.trim() || isTyping || !isDocReady) return;

//         const questionText = input;
//         setInput("");
//         setMessages((prev) => [...prev, { id: makeMsgId(), role: "user", text: questionText }]);
//         setIsTyping(true);
//         setMessages((prev) => [...prev, { id: makeMsgId(), role: "assistant", text: "", citations: [] }]);

//         let hasFirstToken = false;

//         const scheduleFlush = () => {
//             if (flushTimeoutRef.current) return;
//             flushTimeoutRef.current = setTimeout(() => {
//                 flushTimeoutRef.current = null;
//                 const chunk = pendingTextRef.current;
//                 pendingTextRef.current = "";
//                 if (chunk) {
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         const last = updated[updated.length - 1];
//                         updated[updated.length - 1] = { ...last, text: last.text + chunk };
//                         return updated;
//                     });
//                 }
//             }, 40);
//         };

//         try {
//             await sendMessageStream(notebook_id, questionText, {
//                 onCitations: (citations) => {
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         updated[updated.length - 1] = { ...updated[updated.length - 1], citations };
//                         return updated;
//                     });
//                 },
//                 onToken: (token) => {
//                     if (!hasFirstToken) {
//                         hasFirstToken = true;
//                         setIsTyping(false);
//                     }
//                     pendingTextRef.current += token;
//                     scheduleFlush();
//                 },

//                 // Agar Groq ne partial text stream kiya ho aur phir rate limit ki
//                 // wajah se Gemini fallback ho, toh purana partial text aur naya
//                 // Gemini text garbled concatenate ho jaate. Ye pehle clear karta hai.
//                 onReset: () => {
//                     if (flushTimeoutRef.current) {
//                         clearTimeout(flushTimeoutRef.current);
//                         flushTimeoutRef.current = null;
//                     }
//                     pendingTextRef.current = "";
//                     setMessages((prev) => {
//                         const updated = [...prev];
//                         const last = updated[updated.length - 1];
//                         updated[updated.length - 1] = { ...last, text: "" };
//                         return updated;
//                     });
//                 },

//                 onDone: () => {
//                     if (flushTimeoutRef.current) {
//                         clearTimeout(flushTimeoutRef.current);
//                         flushTimeoutRef.current = null;
//                     }
//                     if (pendingTextRef.current) {
//                         const chunk = pendingTextRef.current;
//                         pendingTextRef.current = "";
//                         setMessages((prev) => {
//                             const updated = [...prev];
//                             const last = updated[updated.length - 1];
//                             updated[updated.length - 1] = { ...last, text: last.text + chunk };
//                             return updated;
//                         });
//                     }
//                     setIsTyping(false);
//                 },
//                 onError: (msg) => {
//                     toast.error(msg || "Failed to get response");
//                     setIsTyping(false);
//                     dropTrailingEmptyAssistant();
//                 },
//             });
//         } catch (err) {
//             console.error(err);
//             toast.error("Something went wrong");
//             setIsTyping(false);
//             dropTrailingEmptyAssistant();
//         }
//     };

//     if (pageLoading) {
//         return (
//             <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-xl shadow-brand-primary/30 animate-pulse">
//                     <BookOpen className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="flex flex-col items-center gap-1">
//                     <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
//                     <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium tracking-wide uppercase">
//                         Loading notebook...
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="h-screen w-full flex flex-col bg-surface-default dark:bg-[#0F0F0F] overflow-hidden">

//             <LimitReachedModal
//                 open={limitModal.open}
//                 onClose={() => setLimitModal((prev) => ({ ...prev, open: false }))}
//                 limitType={limitModal.limitType}
//                 used={limitModal.used}
//                 total={limitModal.total}
//             />

//             <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-16 border-b border-b-lines-divider bg-sidebar-fill shrink-0 z-20">
//                 <div className="flex items-stretch gap-2 sm:gap-3 shrink-0">
//                     <Link
//                         to="/"
//                         className="group flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 text-xs font-medium"
//                         title="Back to notebooks"
//                     >
//                         <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
//                         <span className="hidden sm:inline">Notebooks</span>
//                     </Link>

//                     <div className="w-px h-6 my-auto bg-zinc-200 dark:bg-zinc-800 shrink-0" />

//                     <div className="w-8 h-8 rounded-md bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm shadow-brand-primary/30 shrink-0">
//                         <BookOpen className="w-4.5 h-4.5 text-white" />
//                     </div>
//                 </div>

//                 <div className="flex-1 min-w-0 flex items-center p-2">
//                     {isEditingTitle ? (
//                         <div className="flex items-center gap-1.5 w-full max-w-md">
//                             <input
//                                 ref={titleInputRef}
//                                 value={titleDraft}
//                                 onChange={(e) => setTitleDraft(e.target.value)}
//                                 onKeyDown={handleTitleKeyDown}
//                                 onBlur={handleSaveTitle}
//                                 className="flex-1 min-w-0 text-lg sm:text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 outline outline-brand-primary/60 rounded-sm px-2.5 py-1 text-zinc-900 dark:text-zinc-100"
//                                 placeholder="Notebook title..."
//                             />
//                         </div>
//                     ) : (
//                         <button
//                             type="button"
//                             onClick={() => { setIsEditingTitle(true); setTitleDraft(title); }}
//                             title="Click to rename"
//                             className="group flex items-center gap-2 min-w-0 max-w-full sm:max-w-sm text-left"
//                         >
//                             <span className="text-lg sm:text-xl font-medium text-content-default truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
//                                 {title}
//                             </span>
//                             <span className="shrink-0 hidden sm:flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 duration-300 transition-opacity">
//                                 <Pencil className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
//                             </span>
//                         </button>
//                     )}
//                 </div>

//                 <ThemeToggle />
//             </header>

//             <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

//                 <div className="md:hidden flex items-center gap-1 p-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">

//                     <button
//                         type="button"
//                         onClick={() => setMobileTab("sources")}
//                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "sources"
//                             ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                             : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                             }`}
//                     >
//                         <BookOpen className="w-4 h-4" />
//                         Sources
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() => setMobileTab("chat")}
//                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "chat"
//                             ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                             : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                             }`}
//                     >
//                         <MessageSquare className="w-4 h-4" />
//                         Chat
//                     </button>
//                 </div>

//                 <div className="relative flex flex-1 overflow-hidden">

//                     <div className={`absolute inset-0 md:static md:flex overflow-hidden transition-transform duration-300 ease-in-out ${mobileTab === 'sources' ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
//                         <NotebookSidebar document={doc} documentUrl={documentUrl} />
//                     </div>

//                     <main className={`absolute inset-0 md:static md:flex md:flex-1 flex-col min-w-0 overflow-hidden transition-transform duration-300 ease-in-out ${mobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>

//                         {!doc ? (
//                             <UploadPrompt
//                                 pendingFile={pendingFile}
//                                 setPendingFile={setPendingFile}
//                                 uploading={isUploading}
//                                 progress={uploadProgress}
//                                 handleUpload={handleUpload}
//                             />
//                         ) : isDocFailed ? (
//                             <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
//                                 <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
//                                     <AlertTriangle className="w-6 h-6 text-danger" />
//                                 </div>
//                                 <div className="space-y-1.5 max-w-sm">
//                                     <h3 className="text-base font-semibold text-content-default">Processing failed</h3>
//                                     <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
//                                         {doc.error_message || "We couldn't process this document. Try uploading it again."}
//                                     </p>
//                                 </div>
//                                 <Button
//                                     variant="outlined"
//                                     color="error"
//                                     onClick={handleRetryUpload}
//                                     startIcon={<RefreshCw className="w-4 h-4" />}
//                                     sx={{ borderRadius: "9999px" }}
//                                 >
//                                     Upload again
//                                 </Button>
//                             </div>
//                         ) : (

//                             <div className="flex-1 flex flex-col w-full overflow-hidden">  

//                                 {isDocProcessing && (
//                                     <div className="mx-4 sm:mx-6 mt-3 flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">
//                                         <Clock className="w-3.5 h-3.5 shrink-0" />
//                                         Your document is still being processed — chat unlocks automatically once it's ready.
//                                     </div>
//                                 )}

//                                 <div className="relative flex-1 overflow-hidden">
//                                     <div
//                                         ref={chatBoxRef}
//                                         onScroll={handleChatScroll}
//                                         className="h-full overflow-y-auto"
//                                     >
//                                         <div className="max-w-250 mx-auto px-4 sm:px-6 py-6 space-y-4">
//                                             {messages.length === 0 ? (
//                                                 <ChatEmptyState
//                                                     docName={doc.filename}
//                                                     onSuggestionClick={handleSuggestionClick}
//                                                 />
//                                             ) : (
//                                                 messages.map((m, i) => (
//                                                     <ChatBubble key={m.id} message={m} index={i} onSuggestionClick={handleSuggestionClick} />
//                                                 ))
//                                             )}

//                                             {(isTyping && !pendingTextRef.current) && (
//                                                 <div className="flex gap-3">
//                                                     <div className="w-8 h-8 rounded-xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-brand-primary/20">
//                                                         <Sparkles className="w-4 h-4 text-white" />
//                                                     </div>
//                                                     <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/60 shadow-sm flex items-center gap-1.5">
//                                                         <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "0ms" }} />
//                                                         <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "150ms" }} />
//                                                         <span className="w-2 h-2 rounded-full bg-brand-primary/70 dark:bg-brand-primary animate-bounce" style={{ animationDelay: "300ms" }} />
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {showScrollButton && messages.length > 0 && (
//                                         <Fab
//                                             size="small"
//                                             color="primary"
//                                             onClick={() => scrollToBottom("smooth")}
//                                             aria-label="Scroll to latest message"
//                                             sx={{ position: "absolute", bottom: 16, right: 16 }}
//                                         >
//                                             <ArrowDown className="w-4 h-4" />
//                                         </Fab>
//                                     )}
//                                 </div>

//                                 <div className="relative shrink-0 px-4 sm:px-6 lg:px-20 pb-5 pt-3 bg-linear-to-t from-zinc-50 dark:from-zinc-950 to-transparent">

//                                     <div className="absolute w-full h-7 bg-[linear-gradient(180deg,#faf9f900_0%,#faf9f980_50%,#faf9f9d9_75%,#faf9f9fc_95%,#faf9f9ff_100%)] dark:bg-[linear-gradient(180deg,#0f0f0f00_0%,#0f0f0f80_50%,#0f0f0fd9_75%,#0f0f0ffc_95%,#0f0f0fff_100%)] right-0 bottom-full"></div>

//                                     <div className="relative flex items-end gap-2 rounded-[30px] bg-white dark:bg-[#1E1F20] shadow-[0_0_8px_-2px] dark:shadow-lg  shadow-black/10 dark:shadow-black/20 px-4 pl-8 py-3 border border-transparent focus-within:border-lines-divider transition-all duration-200">


//                                         <textarea
//                                             ref={inputRef}
//                                             id="chat-input"
//                                             rows={1}
//                                             value={input}
//                                             disabled={!isDocReady}
//                                             onChange={(e) => {
//                                                 setInput(e.target.value);
//                                                 e.target.style.height = "auto";
//                                                 e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
//                                             }}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === "Enter" && !e.shiftKey) {
//                                                     e.preventDefault();
//                                                     handleSend();
//                                                 }
//                                             }}
//                                             placeholder={isDocReady ? "Ask a question about this document..." : "Waiting for the document to finish processing..."}
//                                             className="flex-1 scrollbar-thin min-w-0 resize-none my-auto bg-transparent outline-none text-base text-content-default placeholder:text-content-deemphasized leading-relaxed max-h-30 overflow-y-auto disabled:cursor-not-allowed"
//                                         // style={{ height: "29px" }}
//                                         />
//                                         <Tooltip title="Send">
//                                             <IconButton
//                                                 id="send-message-btn"
//                                                 onClick={handleSend}
//                                                 disabled={!input.trim() || isTyping || !isDocReady}
//                                                 loading={isTyping}
//                                             >
//                                                 <ArrowRight className="size-5" />
//                                             </IconButton>
//                                         </Tooltip>
//                                         {/* <button
//                                             type="button"
//                                             id="send-message-btn"
//                                             onClick={handleSend}
//                                             disabled={!input.trim() || isTyping || !isDocReady}
//                                             aria-label="Send message"
//                                             className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 self-end ${input.trim() && !isTyping && isDocReady
//                                                 ? "bg-linear-to-br from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-md shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5"
//                                                 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed!"
//                                                 }`}
//                                         >
//                                             {isTyping
//                                                 ? <Loader2 className="w-4 h-4 animate-spin" />
//                                                 : <Send className="w-4 h-4" />
//                                             }
//                                         </button> */}
//                                     </div>
//                                     <p className="text-center text-[11px] text-content-deemphasized mt-2 font-medium">
//                                         Answers are grounded in your uploaded document · Press Enter to send
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                     </main>

//                 </div>

//             </div>

//         </div>

//     );

// };

// export default NotebookViewPage;










import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getMessages,
    getNotebook,
    getNotebookStatus,
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

const NotebookViewPage = () => {

    const pendingTextRef = useRef("");
    const flushTimeoutRef = useRef(null);
    const chatBoxRef = useRef(null);
    const nextMsgIdRef = useRef(0);

    const { notebook_id } = useParams();
    const navigate = useNavigate();

    const [pageLoading, setPageLoading] = useState(true);
    const [pendingFile, setPendingFile] = useState(null);
    const [doc, setDoc] = useState(null); // renamed from "document" - was shadowing window.document
    const [documentUrl, setDocumentUrl] = useState(null);

    const [title, setTitle] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"

    const inputRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [limitModal, setLimitModal] = useState({ open: false, limitType: "documents", used: 0, total: 0 });

    const makeMsgId = () => `msg-${Date.now()}-${nextMsgIdRef.current++}`;

    // ── Fetch notebook ──────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setPageLoading(true);
            try {
                const response = await getNotebook(notebook_id);
                if (cancelled) return;
                const docData = response.data.data.document;
                if (docData?.document_url) setDocumentUrl(docData.document_url);
                setDoc(docData);
                setTitle(response.data.data.title);
            } catch (err) {
                if (cancelled) return;
                if (err?.response?.status === 404) {
                    toast.error("Notebook not found");
                    navigate("/", { replace: true });
                } else {
                    toast.error("Could not load notebook");
                }
            } finally {
                if (!cancelled) setPageLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [notebook_id]);

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
    const scrollToBottom = (behavior = "auto") => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleChatScroll = () => {
        const el = chatBoxRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 200);
    };





    // ── Document status polling ─────────────────────────────────────
    useEffect(() => {
        if (!doc || doc.status !== "processing") return;

        let cancelled = false;
        let timeoutId;
        let errorAttempts = 0;
        const MAX_ERROR_ATTEMPTS = 15;

        const poll = async () => {
            try {
                const res = await getNotebookStatus(notebook_id);
                if (cancelled) return;

                errorAttempts = 0;
                const data = res.data.data;
                setDoc((prev) => (prev ? { ...prev, ...data } : prev));
                if (data.document_url) setDocumentUrl(data.document_url);

                if (data.status === "processing") {
                    timeoutId = setTimeout(poll, 3000);
                } else if (data.status === "ready") {
                    toast.success("Document is ready — you can start asking questions!");
                } else if (data.status === "failed") {
                    toast.error(data.error_message || "Document processing failed");
                }
            } catch (err) {
                if (cancelled) return;
                errorAttempts += 1;
                if (errorAttempts >= MAX_ERROR_ATTEMPTS) {
                    toast.error("Couldn't check document status. Please refresh the page.");
                    return;
                }
                timeoutId = setTimeout(poll, 5000);
            }
        };

        timeoutId = setTimeout(poll, 3000);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [notebook_id, doc?.status]);

    // ── Cleanup pending stream-flush timer on unmount ───────────────
    useEffect(() => {
        return () => {
            if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
        };
    }, []);

    // ── Upload ───────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!pendingFile) return;

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

        // const questionText = input;
        setInput("");
        setMessages((prev) => [...prev, { id: makeMsgId(), role: "user", text: questionText }]);
        setIsTyping(true);
        setMessages((prev) => [...prev, { id: makeMsgId(), role: "assistant", text: "", citations: [] }]);

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
                },
                onError: (msg) => {
                    toast.error(msg || "Failed to get response");
                    setIsTyping(false);
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
        // const prompt = `Please explain this in detail: "${selectedText}"`;
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
                        <NotebookSidebar document={doc} documentUrl={documentUrl} />
                    </div>

                    <main className={`absolute inset-0 md:static md:flex md:flex-1 flex-col min-w-0 overflow-hidden transition-transform duration-300 ease-out ${mobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>

                        {!doc ? (

                            <UploadPrompt
                                pendingFile={pendingFile}
                                setPendingFile={setPendingFile}
                                uploading={isUploading}
                                progress={uploadProgress}
                                handleUpload={handleUpload}
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

                                {/* <div className="relative flex-1 overflow-hidden">

                                    <div
                                        ref={chatBoxRef}
                                        onScroll={handleChatScroll}
                                        className="h-full overflow-y-auto"
                                    >

                                        <div className="max-w-250 mx-auto px-4 sm:px-6 py-6 space-y-4">

                                            {messages.length === 0 ? (
                                                <ChatEmptyState
                                                    docName={doc.filename}
                                                    onSuggestionClick={handleSuggestionClick}
                                                />
                                            ) : (
                                                messages.map((m, i) => (
                                                    <ChatBubble
                                                        key={m.id}
                                                        index={i}
                                                        message={m}
                                                        onSuggestionClick={handleSuggestionClick}
                                                        onExplain={handleExplain}
                                                    />
                                                ))
                                            )}

                                            {(isTyping && !pendingTextRef.current) && (
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

                                </div> */}

                                {/* <div className="shrink-0 px-4 sm:px-6 lg:px-10 pb-5 pt-3"> */}

                                {/* <div className="relative max-w-5xl mx-auto w-full shrink-0 px-4 sm:px-6 lg:px-20 pb-5 pt-3 bg-transparent">

                                    <div className="absolute w-full h-7 bg-linear-to-t from-white/90 dark:from-black/90 to-transparent right-0 bottom-full"></div>

                                    <div className="relative flex items-end gap-2 rounded-[30px] bg-white dark:bg-[#1E1F20] shadow-[0_0_8px_-2px] dark:shadow-lg  shadow-black/10 dark:shadow-black/20 px-4 pl-8 py-3 border border-transparent focus-within:border-lines-divider transition-all duration-200">

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
                                                    handleSend();
                                                }
                                            }}
                                            placeholder={isDocReady ? "Ask a question about this document..." : "Waiting for the document to finish processing..."}
                                            className="flex-1 scrollbar-thin min-w-0 resize-none my-auto bg-transparent outline-none text-base text-content-default placeholder:text-content-deemphasized leading-relaxed max-h-30 overflow-y-auto disabled:cursor-not-allowed"
                                        />
                                        <Tooltip title="Send">
                                            <IconButton
                                                id="send-message-btn"
                                                onClick={handleSend}
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

                                </div> */}


                                <ChatInputBar
                                    inputRef={inputRef}
                                    input={input}
                                    setInput={setInput}
                                    onSend={handleSend}
                                    isTyping={isTyping}
                                    isDocReady={isDocReady}
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