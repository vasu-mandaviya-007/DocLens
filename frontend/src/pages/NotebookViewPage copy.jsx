
// import React, { useEffect, useRef } from 'react'
// import { Link, useParams } from "react-router-dom"
// import { getNotebook, renameNotebook } from '../apis/notebookApi.js'
// import { useState } from 'react'
// import { Document } from "react-pdf";
// import { ArrowLeft, BookOpen, Check, Pencil, X, Loader2, FileText } from "lucide-react";
// import { IconButton, TextField } from "@mui/material";
// import toast from 'react-hot-toast';
// import ThemeToggle from '../components/ThemeToggle.jsx'; 
// import UploadPrompt from '../components/notebooks/UploadPrompt.jsx';
// import NotebookSidebar from '../components/notebooks/NotebookSidebar.jsx';


// const NotebookViewPage = () => { 

//     const { notebook_id } = useParams()
//     const [pageLoading, setPageLoading] = useState(true);
//     const [sleectedFile, setSleectedFile] = useState(null);
//     const [document, setDocument] = useState(null)
//     const [documentUrl, setDocumentUrl] = useState(null)

//     const [title, setTitle] = useState(null)
//     const [isEditingTitle, setIsEditingTitle] = useState(false);
//     const [titleDraft, setTitleDraft] = useState("")
//     const [isUploading, setIsUploading] = useState(false);

//     const [sidebarOpen, setSidebarOpen] = useState(false)

//     const titleInputRef = useRef(null);

//     const fetchNotebook = async () => {

//         setPageLoading(true);

//         try {

//             const response = await getNotebook(notebook_id);

//             const doc = response.data.data.document;
//             if (doc?.document_url) {
//                 setDocumentUrl(doc.document_url)
//             }
//             setDocument(doc);
//             setTitle(response.data.data.title);
//             console.log(doc);



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

//     }

//     useEffect(() => {
//         fetchNotebook();
//     }, [])

//     useEffect(() => {

//         if (isEditingTitle && titleInputRef.current) {
//             titleInputRef.current.focus();
//             titleInputRef.current.select();
//         }

//     }, [isEditingTitle])

//     const handleTitleKeyDown = (e) => {

//         if (e.key === "Enter") {
//             e.target.blur()
//         } else if (e.key === "Escape") {
//             setTitleDraft(title);
//             setIsEditingTitle(false);
//         }

//     }

//     const handleSaveTitle = async () => {

//         const trimmed = titleDraft.trim();

//         setIsEditingTitle(false);

//         if (!trimmed || trimmed === title) {
//             setTitleDraft(title);
//             return
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

//     }

//     const handleUpload = async () => {

//         if (!sleectedFile) return;

//         setIsUploading(true);

//         try {

//         } catch (err) {

//         }

//     }

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

//         <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">

//             <header className='flex items-center gap-2 px-4 h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0 z-20'>

//                 <div className="flex items-stretch gap-3 shrink-0">

//                     <Link
//                         to={"/"}
//                         id='back-to-home-btn'
//                         className="group flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 text-xs font-medium"
//                         title="Back to notebooks"
//                     >
//                         <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
//                         <span className="hidden sm:inline">Notebooks</span>
//                     </Link>

//                     <div className="w-px h-6 my-auto bg-zinc-200 dark:bg-zinc-800 shrink-0" />

//                     <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-md bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm shadow-brand-primary/30">
//                             <BookOpen className="w-4.5 h-4.5 text-white" />
//                         </div>
//                         {/* <span className="hidden sm:block text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
//                             DocLens
//                         </span> */}
//                     </div>

//                     {/* <div className="w-px h-6 my-auto bg-zinc-200 dark:bg-zinc-800 shrink-0" /> */}

//                 </div>

//                 <div className="flex-1 min-w-0 flex items-center p-2">

//                     {
//                         isEditingTitle ? (

//                             <div className='flex items-center gap-1.5 w-full max-w-md'>

//                                 <input
//                                     ref={titleInputRef}
//                                     id="notebook-title-input"
//                                     value={titleDraft}
//                                     onChange={(e) => setTitleDraft(e.target.value)}
//                                     onKeyDown={handleTitleKeyDown}
//                                     onBlur={handleSaveTitle}
//                                     className="flex-1 min-w-0 text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 outline outline-brand-primary/60 dark:outline-content-deemphasized rounded-sm px-2.5  py-1 text-zinc-900 dark:text-zinc-100"
//                                     placeholder="Notebook title..."
//                                 />

//                                 {/* <IconButton onClick={handleSaveTitle} color='success' size='small'>
//                                     <Check className='size-4' />
//                                 </IconButton>

//                                 <IconButton
//                                     color='error'
//                                     size='small'
//                                     onClick={() => { setIsEditingTitle(false), setTitleDraft(title) }}
//                                 >
//                                     <X className='size-4' />
//                                 </IconButton> */}

//                             </div>

//                         ) : (
//                             <button
//                                 id="notebook-title-btn"
//                                 onClick={() => { setIsEditingTitle(true), setTitleDraft(title) }}
//                                 title='Click to rename'
//                                 className='group flex items-center gap-2 max-w-sm text-left'
//                             >
//                                 <span className="text-xl font-medium text-content-default truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
//                                     {title}
//                                 </span>
//                                 <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 duration-300 transition-opacity">
//                                     <Pencil className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
//                                 </span>
//                             </button>
//                         )
//                     }


//                 </div>

//                 <ThemeToggle />

//                 {document && (
//                     <button
//                         id="sidebar-toggle-btn"
//                         onClick={() => setSidebarOpen(!sidebarOpen)}
//                         className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
//                     >
//                         <FileText className="w-3.5 h-3.5" />
//                         <span>Sources</span>
//                     </button>
//                 )}

//             </header>


//             <div className='flex flex-1 overflow-hidden relative'>

//                 {/* Sidebar */}
//                 <NotebookSidebar
//                     document={document}
//                     documentUrl={documentUrl}
//                     isOpen={sidebarOpen}
//                     onClose={() => setSidebarOpen(false)}
//                 />

//                 <main className='flex-1 flex flex-col min-w-0 overflow-hidden '>

//                     {
//                         !document
//                             ? (
//                                 <UploadPrompt
//                                     pendingFile={sleectedFile}
//                                     setPendingFile={setSleectedFile}
//                                     uploading={isUploading}
//                                     handleUpload={handleUpload} 
//                                 />
//                             ) : (
//                                 <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>

//                                 </div>
//                             )
//                     }

//                 </main>

//             </div>


//         </div>

//     )
// }

// export default NotebookViewPage










// import { useEffect, useRef, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import { getNotebook, renameNotebook, uploadDocument } from "../apis/notebookApi.js";
// import { ArrowLeft, BookOpen, Pencil, X, Loader2, FileText } from "lucide-react";
// import toast from "react-hot-toast";
// import ThemeToggle from "../components/ThemeToggle.jsx";
// import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
// import NotebookSidebar from "../components/notebooks/NotebookSidebar.jsx";

// const NotebookViewPage = () => {
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

//     const [sidebarOpen, setSidebarOpen] = useState(false);

//     const titleInputRef = useRef(null);

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
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [notebook_id]);

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

//     // NOTE: uploadDocument ka signature yaha (notebookId, file, onUploadProgress)
//     // assume kiya he. Agar tumhare apis/notebookApi.js me ye teesra param nahi
//     // handle hota, to wahan axios call me { onUploadProgress: (e) => onProgress(...) }
//     // config add karna hoga — batao to wo bhi theek kar deta hu.
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
//                 status: res.data.data.status,
//                 page_count: null,
//             });
//             setPendingFile(null);
//             toast.success("Document uploaded");
//         } catch (err) {
//             toast.error(err?.response?.data?.error?.message || "Upload failed");
//         } finally {
//             setIsUploading(false);
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
//         <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
//             <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0 z-20">
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

//                 {document && (
//                     <button
//                         onClick={() => setSidebarOpen((prev) => !prev)}
//                         aria-label={sidebarOpen ? "Close sources" : "Open sources"}
//                         className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
//                     >
//                         {sidebarOpen ? <X className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
//                     </button>
//                 )}
//             </header>

//             <div className="flex flex-1 overflow-hidden relative">
//                 <NotebookSidebar
//                     document={document}
//                     documentUrl={documentUrl}
//                     isOpen={sidebarOpen}
//                     onClose={() => setSidebarOpen(false)}
//                 />

//                 <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
//                     {!document ? (
//                         <UploadPrompt
//                             pendingFile={pendingFile}
//                             setPendingFile={setPendingFile}
//                             uploading={isUploading}
//                             progress={uploadProgress}
//                             handleUpload={handleUpload}
//                         />
//                     ) : (
//                         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//                             {/* Chat UI — agla step */}
//                         </div>
//                     )}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default NotebookViewPage;







// import { useEffect, useRef, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import { getNotebook, renameNotebook, uploadDocument } from "../apis/notebookApi.js";
// import { ArrowLeft, BookOpen, Pencil, Loader2, FileText, MessageSquare } from "lucide-react";
// import toast from "react-hot-toast";
// import ThemeToggle from "../components/ThemeToggle.jsx";
// import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
// import { DesktopSidebar, MobileSourcesPane } from "../components/notebooks/NotebookSidebar.jsx";

// // Chat area abhi placeholder he — dono desktop aur mobile isi ko reuse karte hain
// function ChatPanel() {
//     return (
//         <div className="flex flex-col h-full min-w-0 overflow-hidden items-center justify-center">
//             <p className="text-sm text-zinc-400 dark:text-zinc-600">Chat coming soon</p>
//         </div>
//     );
// }

// const NotebookViewPage = () => {
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
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [notebook_id]);

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
//                 status: res.data.data.status,
//                 page_count: null,
//             });
//             setPendingFile(null);
//             toast.success("Document uploaded");
//         } catch (err) {
//             toast.error(err?.response?.data?.error?.message || "Upload failed");
//         } finally {
//             setIsUploading(false);
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

//         <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">

//             <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0 z-20">

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

//             {!document ? (
//                 <UploadPrompt
//                     pendingFile={pendingFile}
//                     setPendingFile={setPendingFile}
//                     uploading={isUploading}
//                     progress={uploadProgress}
//                     handleUpload={handleUpload}
//                 />
//             ) : (
//                 <>
//                     {/* Desktop (md+): sidebar + chat side-by-side */}
//                     <div className="hidden md:flex flex-1 overflow-hidden">
//                         <DesktopSidebar document={document} documentUrl={documentUrl} />
//                         <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
//                             <ChatPanel />
//                         </main>
//                     </div>

//                     {/* Mobile/Tablet (<md): Chat/Sources top-level tab switch, NotebookLM jaisa */}
//                     <div className="flex md:hidden flex-1 flex-col overflow-hidden">
//                         <div className="flex items-center gap-1 p-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
//                             <button
//                                 onClick={() => setMobileTab("chat")}
//                                 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "chat"
//                                     ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                                     : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                                     }`}
//                             >
//                                 <MessageSquare className="w-4 h-4" />
//                                 Chat
//                             </button>
//                             <button
//                                 onClick={() => setMobileTab("sources")}
//                                 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "sources"
//                                     ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
//                                     : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                                     }`}
//                             >
//                                 <FileText className="w-4 h-4" />
//                                 Sources
//                             </button>
//                         </div>

//                         <div className="flex-1 overflow-hidden">
//                             {mobileTab === "sources" ? (
//                                 <MobileSourcesPane document={document} documentUrl={documentUrl} />
//                             ) : (
//                                 <ChatPanel />
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default NotebookViewPage;








import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getNotebook, renameNotebook, uploadDocument } from "../apis/notebookApi.js";
import { ArrowLeft, BookOpen, Pencil, Loader2, FileText, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UploadPrompt from "../components/notebooks/UploadPrompt.jsx";
import NotebookSidebar from "../components/notebooks/NotebookSidebar.jsx";
import useIsDesktop from "../hooks/useDesktop.js";

// Chat area abhi placeholder he 
function ChatPanel() {
    return (
        <div className="flex flex-col h-full min-w-0 overflow-hidden items-center justify-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Chat coming soon</p>
        </div>
    );
}

const NotebookViewPage = () => {
    const { notebook_id } = useParams();
    const navigate = useNavigate();

    const [pageLoading, setPageLoading] = useState(true);
    const [pendingFile, setPendingFile] = useState(null);
    const [document, setDocument] = useState(null);
    const [documentUrl, setDocumentUrl] = useState(null);

    const [title, setTitle] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "sources"

    const isDesktop = useIsDesktop();

    const titleInputRef = useRef(null);

    const fetchNotebook = async () => {
        setPageLoading(true);
        try {
            const response = await getNotebook(notebook_id);
            const doc = response.data.data.document;
            if (doc?.document_url) setDocumentUrl(doc.document_url);
            setDocument(doc);
            setTitle(response.data.data.title);
        } catch (err) {
            if (err?.response?.status === 404) {
                toast.error("Notebook not found");
                navigate("/", { replace: true });
            } else {
                toast.error("Could not load notebook");
            }
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchNotebook();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebook_id]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.target.blur();
        } else if (e.key === "Escape") {
            setTitleDraft(title);
            setIsEditingTitle(false);
        }
    };

    const handleSaveTitle = async () => {
        const trimmed = titleDraft.trim();
        setIsEditingTitle(false);

        if (!trimmed || trimmed === title) {
            setTitleDraft(title);
            return;
        }

        const previousTitle = title;
        setTitle(trimmed);
        try {
            await renameNotebook(notebook_id, trimmed);
            toast.success("Title updated");
        } catch {
            setTitle(previousTitle);
            toast.error("Could not update title");
        }
    };

    const handleUpload = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        setUploadProgress(0);
        try {
            const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
                setUploadProgress(percent);
            });

            setDocument({
                filename: res.data.data.filename,
                status: res.data.data.status,
                page_count: null,
            });
            setPendingFile(null);
            toast.success("Document uploaded");
        } catch (err) {
            toast.error(err?.response?.data?.error?.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-xl shadow-brand-primary/30 animate-pulse">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium tracking-wide uppercase">
                        Loading notebook...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">

            <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0 z-20">

                <div className="flex items-stretch gap-2 sm:gap-3 shrink-0">

                    <Link
                        to="/"
                        className="group flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 text-xs font-medium"
                        title="Back to notebooks"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                        <span className="hidden sm:inline">Notebooks</span>
                    </Link>

                    <div className="w-px h-6 my-auto bg-zinc-200 dark:bg-zinc-800 shrink-0" />

                    <div className="w-8 h-8 rounded-md bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm shadow-brand-primary/30 shrink-0">
                        <BookOpen className="w-4.5 h-4.5 text-white" />
                    </div>

                </div>

                <div className="flex-1 min-w-0 flex items-center p-2">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-1.5 w-full max-w-md">
                            <input
                                ref={titleInputRef}
                                value={titleDraft}
                                onChange={(e) => setTitleDraft(e.target.value)}
                                onKeyDown={handleTitleKeyDown}
                                onBlur={handleSaveTitle}
                                className="flex-1 min-w-0 text-lg sm:text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 outline outline-brand-primary/60 rounded-sm px-2.5 py-1 text-zinc-900 dark:text-zinc-100"
                                placeholder="Notebook title..."
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => { setIsEditingTitle(true); setTitleDraft(title); }}
                            title="Click to rename"
                            className="group flex items-center gap-2 min-w-0 max-w-full sm:max-w-sm text-left"
                        >
                            <span className="text-lg sm:text-xl font-medium text-content-default truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
                                {title}
                            </span>
                            <span className="shrink-0 hidden sm:flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 duration-300 transition-opacity">
                                <Pencil className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
                            </span>
                        </button>
                    )}
                </div>

                <ThemeToggle />

            </header>

            {!document ? (
                <UploadPrompt
                    pendingFile={pendingFile}
                    setPendingFile={setPendingFile}
                    uploading={isUploading}
                    progress={uploadProgress}
                    handleUpload={handleUpload}
                />
            ) : (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                    {/* Mobile Tabs Switcher (Hidden on Desktop) */}
                    <div className="md:hidden flex items-center gap-1 p-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
                        <button
                            onClick={() => setMobileTab("sources")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "sources"
                                ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
                                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Sources
                        </button>
                        <button
                            onClick={() => setMobileTab("chat")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${mobileTab === "chat"
                                ? "bg-brand-primary/10 text-brand-primary dark:text-blue-400"
                                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </button>
                    </div>

                    {/* SIDEBAR WRAPPER */}
                    {/* <div className={`${mobileTab === 'sources' ? 'flex grow h-full  translate-x-0' : '-translate-x-full hidden md:translate-x-0'} transition-transform duration-300 md:flex overflow-hidden`}> */}
                    {/* <main className={`${mobileTab === 'chat' ? 'flex flex-1 translate-x-0' : 'translate-x-full md:translate-x-0'} transition-transform duration-300 flex-col min-w-0 overflow-hidden`}> */}

                    {
                        isDesktop ? (

                            <div className="flex flex-1 overflow-hidden">

                                <div className={`md:flex overflow-hidden`}>
                                    <NotebookSidebar document={document} isDesktop={isDesktop} documentUrl={documentUrl} />
                                </div>

                                {/* CHAT WRAPPER */}
                                <main className={`flex flex-1 flex-col min-w-0 overflow-hidden`}>
                                    <ChatPanel />
                                </main>

                            </div>

                        ) : (

                            <div className="flex flex-1 overflow-hidden">

                                <div className={`${mobileTab === "sources" ? `translate-x-0 grow w-full` : "-translate-x-full grow-0"} transition-transform duration-300 overflow-hidden`}>
                                    <NotebookSidebar document={document} isDesktop={isDesktop} documentUrl={documentUrl} />
                                </div>

                                {/* CHAT WRAPPER */}
                                <main className={`${mobileTab === "chat" ? `translate-x-0 w-full grow` : "translate-x-full grow-0"}  transition-transform duration-300 flex-col min-w-0 overflow-hidden`}>
                                    <ChatPanel />
                                </main>

                            </div>
                        )
                    }

                </div>
            )}
        </div>
    );
};

export default NotebookViewPage;