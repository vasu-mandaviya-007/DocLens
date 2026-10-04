// import { useState } from "react";
// import { List, Eye, UploadCloud, PanelLeftClose, PanelLeftOpen } from "lucide-react";
// import DocumentBadge from "./DocumentBadge.jsx";
// import PdfPreviewPanel from "./PdfPreviewPanel.jsx"; 

// export default function NotebookSidebar({ document, documentUrl, isOpen, onClose }) {

//     const [activeTab, setActiveTab] = useState("sources");
//     const [collapsed, setCollapsed] = useState(false); // desktop-only collapse 

//     const previewActive = activeTab === "preview"; 

//     return (
//         <>
//             <aside className={`flex flex-col text-nowrap shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden z-10 ${isOpen
//                     /* mobile overlay — wider for preview */
//                     ? `absolute inset-y-0 left-0 shadow-2xl shadow-black/10 dark:shadow-black/40 ${previewActive ? "w-[90vw] max-w-120" : "w-80"}`
//                     : collapsed
//                         ? "hidden md:flex md:w-0 border-r-0 overflow-hidden"
//                         /* desktop — expands when preview is active */
//                         : `hidden md:flex ${previewActive ? "md:w-105 lg:w-125" : "md:w-72 lg:w-80"}`
//                 }`}>

//                 {/* ── Tab Bar ── */}
//                 <div className="flex items-center gap-0.5 px-2 pt-2.5 pb-0 shrink-0">
//                     <button
//                         id="sidebar-tab-sources"
//                         onClick={() => { setActiveTab("sources"); setCollapsed(false); }}
//                         className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all duration-150 border-b-2 ${activeTab === "sources"
//                                 ? "border-brand-primary text-brand-primary dark:text-blue-400 bg-brand-primary/5 dark:bg-brand-primary/5"
//                                 : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
//                             }`}
//                     >
//                         <List className="w-3.5 h-3.5" />
//                         Sources
//                         <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "sources"
//                                 ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400"
//                                 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
//                             }`}>
//                             {document ? "1" : "0"}
//                         </span>
//                     </button>

//                     <button
//                         id="sidebar-tab-preview"
//                         onClick={() => { setActiveTab("preview"); setCollapsed(false); }}
//                         disabled={!document}
//                         className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all duration-150 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === "preview"
//                                 ? "border-brand-primary text-brand-primary dark:text-blue-400 bg-brand-primary/5 dark:bg-brand-primary/5"
//                                 : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
//                             }`}
//                     >
//                         <Eye className="w-3.5 h-3.5" />
//                         Preview
//                     </button>

//                     {/* Filler + collapse button */}
//                     <div className="flex-1 border-b-2 border-zinc-100 dark:border-zinc-800 self-end flex justify-end items-end pr-1 pb-0.5">
//                         <button
//                             onClick={() => setCollapsed(true)}
//                             title="Collapse sidebar"
//                             className="hidden md:flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
//                         >
//                             <PanelLeftClose className="w-3.5 h-3.5" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Sources Tab ── */}
//                 {activeTab === "sources" && ( 
//                     <div className="flex flex-col flex-1 overflow-hidden">
//                         <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
//                             {document ? (
//                                 <DocumentBadge doc={document} />
//                             ) : (
//                                 <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-4">
//                                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-center">
//                                         <UploadCloud className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">No sources yet</p>
//                                         <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 leading-relaxed">
//                                             Upload a document to get started
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
//                             <p className="text-[11px] text-zinc-300 dark:text-zinc-700 font-medium text-center">
//                                 Supports PDF · DOCX · TXT
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* ── Preview Tab ── */}
//                 {activeTab === "preview" && document && (
//                     <PdfPreviewPanel document={document} documentUrl={documentUrl} />
//                 )}
//             </aside>

//             {/* Desktop: thin strip to re-open when collapsed */}
//             {collapsed && (
//                 <div className="hidden md:flex flex-col items-center py-3 gap-3 w-9 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
//                     <button
//                         onClick={() => setCollapsed(false)}
//                         title="Expand sidebar"
//                         className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                     >
//                         <PanelLeftOpen className="w-4 h-4" />
//                     </button>
//                 </div>
//             )}

//             {/* Mobile backdrop */} 
//             {isOpen && (
//                 <div
//                     className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-5"
//                     onClick={onClose}
//                 />
//             )}
//         </>
//     );
// }







import { useState } from "react";
import { List, Eye, UploadCloud, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import DocumentBadge from "./DocumentBadge.jsx";
import PdfPreviewPanel from "./PdfPreviewPanel.jsx";

const EXPANDED_WIDTH = {
    normal: "md:w-72 lg:w-80",
    preview: "md:w-105 lg:w-125",
};

export default function NotebookSidebar({ document, documentUrl, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("sources");
    const [collapsed, setCollapsed] = useState(false); // desktop-only collapse

    const previewActive = activeTab === "preview";
    const expandedWidthClass = previewActive ? EXPANDED_WIDTH.preview : EXPANDED_WIDTH.normal;
    // const mobileWidthClass = previewActive ? "w-[90vw] max-w-120" : "w-80";
    const mobileWidthClass = previewActive ? "w-[90vw] max-w-120" : "w-[85vw] max-w-80";

    const outerWidthClass = isOpen
        ? mobileWidthClass
        : collapsed
            ? "md:w-15"
            : expandedWidthClass;

    return (
        <>
            <aside
                className={`relative shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900
                    overflow-hidden transition-[width] duration-300 ease-in-out z-10
                    ${isOpen
                        ? `absolute inset-y-0 left-0 shadow-2xl shadow-black/10 dark:shadow-black/40 ${outerWidthClass}`
                        : `hidden md:block ${outerWidthClass}`
                    }`}
            >

                <div className={`flex flex-col h-full ${isOpen ? mobileWidthClass : expandedWidthClass}`}>

                    <div className="flex items-stretch gap-0.5 px-2 pt-2.5 pb-0 shrink-0">

                        <button
                            onClick={() => setActiveTab("sources")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 border-b-2 ${activeTab === "sources"
                                ? "border-brand-primary text-brand-primary dark:text-blue-400 bg-brand-primary/5"
                                : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                                }`}
                        >
                            <List className="w-3.5 h-3.5 shrink-0" />
                            Sources
                            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${activeTab === "sources"
                                ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
                                }`}>
                                {document ? "1" : "0"}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab("preview")}
                            disabled={!document}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === "preview"
                                ? "border-brand-primary text-brand-primary dark:text-blue-400 bg-brand-primary/5"
                                : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                                }`}
                        >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            Preview
                        </button>

                        <div className="flex-1 h-full border-b-2 border-zinc-100 dark:border-zinc-800 self-end flex justify-end items-center pr-1 pb-0.5">
                            <button
                                onClick={() => setCollapsed(true)}
                                title="Collapse sidebar"
                                className="hidden md:flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
                            >
                                <PanelLeftClose className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {activeTab === "sources" && (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
                                {document ? (
                                    <DocumentBadge doc={document} onClick={() => setActiveTab("preview")} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-4">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-center">
                                            <UploadCloud className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">No sources yet</p>
                                            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 leading-relaxed">
                                                Upload a document to get started
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                                <p className="text-[11px] text-zinc-300 dark:text-zinc-700 font-medium text-center whitespace-nowrap">
                                    Supports PDF · DOCX · TXT
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "preview" && document && (
                        <PdfPreviewPanel document={document} documentUrl={documentUrl} />
                    )}
                </div>

                <button
                    onClick={() => setCollapsed(false)}
                    title="Expand sidebar"
                    className={`hidden md:flex absolute bg-white dark:bg-zinc-900 inset-y-0 left-0 w-full flex-col items-center pt-3 transition-opacity duration-200 ${collapsed ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <PanelLeftOpen className="w-4 h-4" />
                    </span>
                </button>

                {/* Mobile backdrop */}
                <div className="flex-1 h-full border-b-2 border-zinc-100 dark:border-zinc-800 self-end flex justify-end items-center pr-1 pb-0.5 gap-1">
                    {isOpen && (
                        <button
                            onClick={onClose}
                            aria-label="Close sidebar"
                            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(true)}
                        title="Collapse sidebar"
                        aria-label="Collapse sidebar"
                        className="hidden md:flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
                    >
                        <PanelLeftClose className="w-3.5 h-3.5" />
                    </button>
                </div>
            </aside>

            {/* {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-5"
                    onClick={onClose}
                />
            )} */}
        </>
    );
}