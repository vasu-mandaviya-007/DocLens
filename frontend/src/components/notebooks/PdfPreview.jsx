import { useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, Download, Search, X } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function PdfPreview({
    fileUrl,
    filename,
    pageNumber,
    setPageNumber,
    numPages, 
    setNumPages,
    hasError,
    setHasError,
}) {
    const [pageTexts, setPageTexts] = useState({}); // { 1: "page 1 text", 2: "..." }
    const [searchTerm, setSearchTerm] = useState("");
    const [matchingPages, setMatchingPages] = useState([]);
    const [matchIndex, setMatchIndex] = useState(0);
    const [searching, setSearching] = useState(false);

    const handleDocumentLoad = async (pdf) => {
        setNumPages(pdf.numPages);

        // Search ke liye har page ka text ek baar extract kar lete hain
        const texts = {};
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            texts[i] = content.items.map((item) => item.str).join(" ");
        }
        setPageTexts(texts);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim().toLowerCase();
        if (!term) return;

        const matches = Object.entries(pageTexts)
            .filter(([, text]) => text.toLowerCase().includes(term))
            .map(([page]) => Number(page));

        setMatchingPages(matches);
        setMatchIndex(0);
        if (matches.length > 0) setPageNumber(matches[0]);
    };

    const goToMatch = (direction) => {
        if (matchingPages.length === 0) return;
        const nextIndex = (matchIndex + direction + matchingPages.length) % matchingPages.length;
        setMatchIndex(nextIndex);
        setPageNumber(matchingPages[nextIndex]);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setMatchingPages([]);
        setMatchIndex(0);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename || "document.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(fileUrl, "_blank"); // fallback agar fetch fail ho (CORS etc.)
        }
    };

    if (hasError) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
                    Could not load the preview.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Toolbar: search + download */}
            <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <form onSubmit={handleSearch} className="flex items-center flex-1 min-w-0 gap-1">
                    <div className="flex items-center flex-1 min-w-0 gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <Search className="w-3 h-3 text-zinc-400 shrink-0" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search in document"
                            className="flex-1 min-w-0 bg-transparent outline-none text-xs text-zinc-900 dark:text-zinc-100"
                        />
                        {searchTerm && (
                            <button type="button" onClick={clearSearch}>
                                <X className="w-3 h-3 text-zinc-400" />
                            </button>
                        )}
                    </div>
                </form>
                <button
                    onClick={handleDownload}
                    title="Download"
                    className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <Download className="w-3.5 h-3.5" />
                </button>
            </div>

            {matchingPages.length > 0 && (
                <div className="flex items-center justify-between px-2.5 py-1 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                        {matchIndex + 1} of {matchingPages.length} pages
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToMatch(-1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ChevronLeft className="w-3 h-3 text-zinc-500" />
                        </button>
                        <button onClick={() => goToMatch(1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ChevronRight className="w-3 h-3 text-zinc-500" />
                        </button>
                    </div>
                </div>
            )}
            {searchTerm && matchingPages.length === 0 && Object.keys(pageTexts).length > 0 && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-600 px-2.5 py-1 border-b border-zinc-200 dark:border-zinc-800">
                    No matches found
                </p>
            )}

            <div className="flex-1 overflow-auto flex justify-center p-3 bg-zinc-100 dark:bg-zinc-950">
                <Document
                    file={fileUrl}
                    onLoadSuccess={handleDocumentLoad}
                    onLoadError={() => setHasError(true)}
                    loading={
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        width={240}
                        // renderAnnotationLayer={false}
                        // renderTextLayer={false}
                    />
                </Document>
            </div>

            {numPages > 0 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}