import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { UploadCloud, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import DocumentBadge from "./DocumentBadge.jsx";
import DocumentPreviewPanel from "./DocumentPreviewPanel.jsx";

const MIN_WIDTH = 260;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH_SOURCES = 320;
const DEFAULT_WIDTH_PREVIEW = 420;
const COLLAPSED_WIDTH = 60;

const NotebookSidebar = forwardRef(function NotebookSidebar({ doc, documentUrl, onExplain }, ref) {
    const [activeTab, setActiveTab] = useState("sources");
    const [collapsed, setCollapsed] = useState(false);
    const [width, setWidth] = useState(DEFAULT_WIDTH_SOURCES);
    const [isResizing, setIsResizing] = useState(false);
    const [pendingCitation, setPendingCitation] = useState(null);
    // Preview (PDF viewer / text) load hokar jump-highlight ke liye tayyar hai ya nahi
    const [previewReady, setPreviewReady] = useState(false);

    const asideRef = useRef(null);
    const previewRef = useRef(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const hasManuallyResized = useRef(false);

    const handlePreviewReady = useCallback(() => setPreviewReady(true), []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (!hasManuallyResized.current) {
            setWidth(tab === "preview" ? DEFAULT_WIDTH_PREVIEW : DEFAULT_WIDTH_SOURCES);
        }
    };

    // Preview tab se bahar jaate hi panel unmount ho jata hai. Tab "ready" bhi band, aur ruka hua citation
    // bhi hata do: warna agli baar preview kholne par purana citation achanak chal padta.
    useEffect(() => {
        if (activeTab !== "preview") {
            setPreviewReady(false);
            setPendingCitation(null);
        }
    }, [activeTab]);

    // Chat me citation click hone par NotebookViewPage isko call karta hai. Sidebar expand + preview tab
    // activate karte hain, aur jump/highlight ko "pending" me rakhte hain: preview tab har baar naye sire se
    // mount hota hai aur PDF viewer load hone me time leta hai, to turant jump karne se wo chup-chaap gir jata tha.
    useImperativeHandle(ref, () => ({
        jumpToCitation: (citation) => {
            setCollapsed(false);
            setActiveTab("preview");
            if (!hasManuallyResized.current) setWidth(DEFAULT_WIDTH_PREVIEW);
            setPendingCitation(citation);
        },
    }));

    // Pending citation tab chalta hai jab preview sach me tayyar ho (previewReady).
    useEffect(() => {
        if (!pendingCitation || activeTab !== "preview" || !previewReady) return;

        const citation = pendingCitation;

        if (citation.start_line != null) {
            // Text / code: backend ki exact line range se highlight
            previewRef.current?.highlightLines?.(citation.start_line, citation.end_line ?? citation.start_line);
        } else {
            previewRef.current?.jumpToPage?.(citation.page);

            // "plain" backend se Markdown-free aata hai (strip_markdown): PDF ke text-layer se reliably match
            // hota hai. "snippet" (raw markdown) sirf CitationChip popup ke display ke liye hai.
            const source = citation.plain ?? citation.snippet;
            if (source) {
                // Thoda delay: jumpToPage ka scroll aur search ka scroll aapas me na ladein
                setTimeout(() => previewRef.current?.highlightText?.(source), 200);
            }
        }

        setPendingCitation(null);
    }, [pendingCitation, activeTab, previewReady]);

    const onResizeStart = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = asideRef.current?.offsetWidth ?? width;
    }, [width]);

    useEffect(() => {
        if (!isResizing) return;

        const onMouseMove = (e) => {
            const delta = e.clientX - startXRef.current;
            const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
            hasManuallyResized.current = true;
            setWidth(next);
        };
        const onMouseUp = () => setIsResizing(false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing]);

    return (
        <aside
            ref={asideRef}
            style={{ "--sidebar-width": `${collapsed ? COLLAPSED_WIDTH : width}px` }}
            className={`relative shrink-0 border-r border-r-lines-divider bg-sidebar-fill
                w-full h-full flex flex-col md:w-(--sidebar-width)
                ${isResizing ? "" : "transition-[width] duration-300 ease-out"}`}
        >
            <div className={`flex flex-col h-full w-full transition-opacity duration-200 ${collapsed ? "md:opacity-0 md:invisible" : "opacity-100 visible"}`}>
                <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2.5 shrink-0">
                    <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-emphasized p-0.5" role="tablist" aria-label="Notebook panels">
                        <button
                            role="tab"
                            aria-selected={activeTab === "sources"}
                            onClick={() => handleTabChange("sources")}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "sources" ? "bg-surface-default text-content-default shadow-sm" : "text-content-deemphasized hover:text-content-default"}`}
                        >
                            Sources
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "preview"}
                            onClick={() => handleTabChange("preview")}
                            disabled={!doc}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === "preview" ? "bg-surface-default text-content-default shadow-sm" : "text-content-deemphasized hover:text-content-default"}`}
                        >
                            Preview
                        </button>
                    </div>

                    <button
                        onClick={() => setCollapsed(true)}
                        title="Collapse sidebar"
                        aria-label="Collapse sidebar"
                        className="hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-emphasized text-content-deemphasized hover:text-content-default transition-colors shrink-0"
                    >
                        <PanelLeftClose className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                </div>

                {activeTab === "sources" && (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {doc ? (
                                <DocumentBadge doc={doc} onClick={() => handleTabChange("preview")} />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-4">
                                    <div className="w-11 h-11 rounded-2xl bg-surface-emphasized flex items-center justify-center">
                                        <UploadCloud className="w-4.5 h-4.5 text-content-deemphasized" strokeWidth={1.75} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-content-deemphasized">No sources yet</p>
                                        <p className="text-xs text-content-deemphasized/70 mt-0.5 leading-relaxed">
                                            Upload a document to get started
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-2.5 border-t border-lines-divider shrink-0">
                            <p className="text-[11px] text-content-deemphasized/70 font-medium text-center whitespace-nowrap">
                                Supports PDF · DOCX · TXT · MD · Code
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === "preview" && doc && (
                    <DocumentPreviewPanel
                        ref={previewRef}
                        document={doc}
                        documentUrl={documentUrl}
                        onExplain={onExplain}
                        onReady={handlePreviewReady}
                    />
                )}
            </div>

            <button
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className={`hidden cursor-pointer md:flex absolute bg-sidebar-fill inset-y-0 left-0 w-full flex-col items-center pt-3 transition-opacity duration-200 ${collapsed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                <span className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-emphasized text-content-deemphasized hover:text-content-default transition-colors">
                    <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
                </span>
            </button>

            {!collapsed && (
                <div
                    onMouseDown={onResizeStart}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize sidebar"
                    className={`hidden md:block absolute top-0 right-0 h-full w-1.5 -mr-0.5 cursor-col-resize z-20 group ${isResizing ? "bg-primary/40" : "hover:bg-primary/20"}`}
                >
                    <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${isResizing ? "bg-primary" : "bg-transparent group-hover:bg-primary/50"}`} />
                </div>
            )}
        </aside>
    );
});

export default NotebookSidebar;