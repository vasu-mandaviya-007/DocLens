// import { useState, useEffect } from "react";
// import { FileText, Loader2, ExternalLink, RefreshCw } from "lucide-react";

// function buildViewerUrl(rawUrl) {
//     return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
// }

// export const PdfPreviewPanel = ({ document, documentUrl }) => { 

//     const [iframeKey, setIframeKey] = useState(0);
//     const [loading, setLoading] = useState(true);

//     // documentUrl badle to loading state reset karo — warna purani state
//     // (false) atki reh jaati he aur naya PDF load hote waqt shimmer nahi dikhta
//     useEffect(() => {
//         setLoading(true);
//         setIframeKey((k) => k + 1);
//     }, [documentUrl]);

//     const reload = () => {
//         setLoading(true);
//         setIframeKey((k) => k + 1);
//     };

//     return (
//         <div className="flex flex-col flex-1 overflow-hidden min-w-0">
//             <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0 min-w-0">
//                 <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
//                     <FileText className="w-3 h-3 text-indigo-500" />
//                 </div>
//                 <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1 min-w-0">
//                     {document.filename}
//                 </p>
//                 {document.page_count && (
//                     <span className="text-[10px] text-zinc-400 shrink-0 whitespace-nowrap mr-1">{document.page_count}p</span>
//                 )}
//                 {documentUrl && ( 
//                     <>
//                         <button
//                             onClick={reload}
//                             title="Reload preview"
//                             className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
//                         >
//                             <RefreshCw className="w-3 h-3" />
//                         </button>
//                         <a
//                             href={documentUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             title="Open in new tab"
//                             className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
//                         >
//                             <ExternalLink className="w-3 h-3" />
//                         </a>
//                     </>
//                 )}
//             </div>

//             <div className="relative flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
//                 {documentUrl ? (
//                     <>
//                         {loading && (
//                             <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-950 z-10">
//                                 <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
//                                     <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
//                                 </div>
//                                 <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">
//                                     Loading preview…
//                                 </p>
//                             </div>
//                         )}
//                         <iframe
//                             key={iframeKey}
//                             src={buildViewerUrl(documentUrl)}
//                             className="w-full h-full border-none"
//                             title={`Preview: ${document.filename}`}
//                             onLoad={() => setLoading(false)}
//                         />
//                     </>
//                 ) : (
//                     <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
//                         <div className="relative">
//                             <div className="w-16 h-20 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center">
//                                 <FileText className="w-7 h-7 text-zinc-300 dark:text-zinc-600" />
//                             </div>
//                             {document.status === "processing" && (
//                                 <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center">
//                                     <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
//                                 </div>
//                             )}
//                         </div>
//                         <div className="space-y-1">
//                             <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
//                                 {document.status === "processing" ? "Processing document..." : "Preview unavailable"}
//                             </p>
//                             <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
//                                 {document.status === "processing"
//                                     ? "The document is being processed. Preview will appear here once it's ready."
//                                     : "The document preview URL is not yet available from the backend."}
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }


// export default PdfPreviewPanel;





// import { forwardRef, useImperativeHandle, useRef } from 'react';
// import { PDFViewer } from '@embedpdf/react-pdf-viewer';
// import { FileText } from 'lucide-react';

// const PdfPreviewPanel = forwardRef(function PdfPreviewPanel({ document, documentUrl }, ref) {
//     const viewerRef = useRef(null);

//     useImperativeHandle(ref, () => ({
//         jumpToPage: async (pageNumber) => {
//             const registry = await viewerRef.current?.registry;
//             if (!registry) return;
//             registry.getPlugin('scroll').provides().scrollToPage({ pageNumber });
//         },

//         // Citation text ko dhundhega aur highlight/scroll karega
//         highlightText: async (searchText) => {
//             const registry = await viewerRef.current?.registry;
//             if (!registry) return;

//             const search = registry.getPlugin('search').provides();

//             // Search session shuru karo (kai versions me zaroori hota he startSearch pehle)
//             search.startSearch();

//             // Poore document me dhundo
//             const task = search.searchAllPages(searchText);

//             task?.wait?.((result) => {
//                 // result me total matches ki info hogi — pehle match pe jump karo
//                 if (result?.total > 0) {
//                     search.goToResult(0); // pehla match — index 0
//                 } else {
//                     console.warn('Koi match nahi mila:', searchText);
//                 }
//             });
//         },
//     }));

//     if (!documentUrl) { 
//         return (
//             <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
//                 <FileText className="w-7 h-7 text-zinc-300 dark:text-zinc-600" />
//                 <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
//                     {document?.status === 'processing' ? 'Processing document...' : 'Preview unavailable'}
//                 </p>
//             </div>
//         );
//     }

//     // documentUrl guaranteed truthy past this point — no need for a second
//     // fallback branch here (the previous version had one that could never run).
//     return (
//         <div className="relative flex-1 overflow-hidden">
//             <PDFViewer
//                 config={{
//                     src: documentUrl,
//                     disabledCategories: ["sidebar", "insert", "form", "shapes", "comments", "annotation", "redaction"]
//                 }}
//                 style={{ height: '100%', width: '100%' }}
//             />
//         </div>
//     );
// });

// export default PdfPreviewPanel;











import { forwardRef, useImperativeHandle, useRef } from 'react';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { FileText } from 'lucide-react';

const PdfPreviewPanel = forwardRef(function PdfPreviewPanel({ document, documentUrl }, ref) {
    const viewerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        jumpToPage: async (pageNumber) => {
            const registry = await viewerRef.current?.registry;
            if (!registry) return;
            registry.getPlugin('scroll').provides().scrollToPage({ pageNumber });
        },

        // Citation text ko dhundhega aur highlight/scroll karega
        highlightText: async (searchText) => {
            const registry = await viewerRef.current?.registry;
            if (!registry) return;

            const search = registry.getPlugin('search').provides();
            search.startSearch();
            const task = search.searchAllPages(searchText);

            task?.wait?.((result) => {
                if (result?.total > 0) {
                    search.goToResult(0);
                } else {
                    console.warn('Koi match nahi mila:', searchText);
                }
            });
        },
    }));

    if (!documentUrl) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
                <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
                <p className="text-xs font-medium text-content-deemphasized">
                    {document?.status === 'processing' ? 'Processing document...' : 'Preview unavailable'}
                </p>
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden">
            <PDFViewer
                config={{
                    src: documentUrl,
                    disabledCategories: ["sidebar", "insert", "form", "shapes", "comments", "annotation", "redaction"]
                }}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
});

export default PdfPreviewPanel;