// import { createPluginRegistration } from '@embedpdf/core';
// import { EmbedPDF } from '@embedpdf/core/react';
// import { usePdfiumEngine } from '@embedpdf/engines/react';

// import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
// import { Scroller, ScrollPluginPackage } from '@embedpdf/plugin-scroll/react';
// import {
//     DocumentContent,
//     DocumentManagerPluginPackage,
// } from '@embedpdf/plugin-document-manager/react';
// import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
// import { ZoomPluginPackage, ZoomMode } from '@embedpdf/plugin-zoom/react';
// import {
//     PagePointerProvider,
//     InteractionManagerPluginPackage,
// } from '@embedpdf/plugin-interaction-manager/react';
// import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/react';
// import { Loader2 } from 'lucide-react';

// import ZoomToolbar from './ZoomToolbar.jsx'; 
// import TextSelectionMenu from './TextSelectionMenu.jsx';
// import React, { useMemo } from 'react';

// import { SearchPluginPackage } from '@embedpdf/plugin-search/react';
// import { SearchLayer } from '@embedpdf/plugin-search/react';
// import SearchPanel from './SearchPanel.jsx';
// import { Search as SearchIcon } from 'lucide-react';

// import { useState } from 'react';
// import PageNavigation from './PageNavigation.jsx';
// import ThumbnailSidebar from './ThumbnailSidebar.jsx'; 
// import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/preact';

// const HeadlessPdfViewer = ({ documentUrl, onExplain }) => {

//     const { engine, isLoading, error } = usePdfiumEngine();

//     const plugins = useMemo(() => [
//         createPluginRegistration(DocumentManagerPluginPackage, {
//             initialDocuments: [{ url: documentUrl }],
//         }),
//         createPluginRegistration(ZoomPluginPackage, {
//             defaultZoomLevel: ZoomMode.FitPage,
//         }),
//         createPluginRegistration(ThumbnailPluginPackage, {
//             width: 120,
//             paddingY: 10,
//         }),
//         createPluginRegistration(SearchPluginPackage),
//         createPluginRegistration(ViewportPluginPackage),
//         createPluginRegistration(ScrollPluginPackage),
//         createPluginRegistration(RenderPluginPackage),
//         createPluginRegistration(ZoomPluginPackage),
//         createPluginRegistration(InteractionManagerPluginPackage),
//         createPluginRegistration(SelectionPluginPackage),
//     ], [documentUrl]);

//     const [searchOpen, setSearchOpen] = useState(false);

//     if (error) {
//         return (
//             <div className="h-full flex items-center justify-center text-sm text-danger px-6 text-center">
//                 Failed to load PDF engine.
//             </div>
//         );
//     }
//     if (isLoading || !engine) {
//         return (
//             <div className="h-full flex items-center justify-center gap-2 text-content-deemphasized">
//                 <Loader2 size={18} className="animate-spin" />
//                 <span className="text-sm">Loading PDF engine...</span>
//             </div>
//         );
//     }

//     return (
//         <div className="relative flex-1 overflow-hidden">

//             <EmbedPDF engine={engine} plugins={plugins}>

//                 {({ activeDocumentId }) =>

//                     activeDocumentId && (

//                         <DocumentContent documentId={activeDocumentId}>

//                             {({ isLoaded }) =>

//                                 isLoaded && (

//                                     <div className="relative flex flex-col h-full w-full">

//                                         <div className="relative flex items-center border-b border-lines-divider shrink-0">
//                                             <ZoomToolbar documentId={activeDocumentId} />
//                                             <button
//                                                 onClick={() => setSearchOpen((v) => !v)}
//                                                 className="p-1.5 rounded hover:bg-surface-emphasized ml-auto mr-2"
//                                             >
//                                                 <SearchIcon className="w-4 h-4" />
//                                             </button>

//                                             {searchOpen && (
//                                                 <SearchPanel documentId={activeDocumentId} onClose={() => setSearchOpen(false)} />
//                                             )}

//                                         </div>

//                                         <PageNavigation documentId={activeDocumentId} />

//                                         <div className="relative flex-1 overflow-hidden" style={{ userSelect: 'none' }} >

//                                             <ThumbnailSidebar documentId={activeDocumentId} />

//                                             <Viewport
//                                                 documentId={activeDocumentId}
//                                                 className="absolute inset-0 bg-gray-200 dark:bg-gray-800"
//                                                 style={{ height: '100%', width: '100%' }}
//                                             >
//                                                 <Scroller
//                                                     documentId={activeDocumentId}
//                                                     renderPage={({ pageIndex, scale, width, height }) => (
//                                                         <div style={{ width, height, position: 'relative' }}>
//                                                             <PagePointerProvider
//                                                                 documentId={activeDocumentId}
//                                                                 pageIndex={pageIndex}
//                                                             >
//                                                                 <RenderLayer
//                                                                     documentId={activeDocumentId}
//                                                                     pageIndex={pageIndex}
//                                                                     scale={scale}
//                                                                     className="pointer-events-none"
//                                                                 />
//                                                                 <SelectionLayer
//                                                                     documentId={activeDocumentId}
//                                                                     pageIndex={pageIndex}
//                                                                     selectionMenu={(props) => (
//                                                                         <TextSelectionMenu
//                                                                             {...props}
//                                                                             documentId={activeDocumentId}
//                                                                             onExplain={onExplain}
//                                                                         />
//                                                                     )}
//                                                                 />
//                                                                 <SearchLayer documentId={activeDocumentId} pageIndex={pageIndex} scale={scale} />
//                                                             </PagePointerProvider>
//                                                         </div>
//                                                     )}
//                                                 />
//                                             </Viewport>
//                                         </div>
//                                     </div>
//                                 )
//                             }
//                         </DocumentContent>
//                     )
//                 }
//             </EmbedPDF>
//         </div>
//     );
// }


// export default React.memo(HeadlessPdfViewer);

















// import { createPluginRegistration } from '@embedpdf/core';
// import { EmbedPDF } from '@embedpdf/core/react';
// import { usePdfiumEngine } from '@embedpdf/engines/react';

// import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
// import { Scroller, ScrollPluginPackage } from '@embedpdf/plugin-scroll/react';
// import {
//     DocumentContent,
//     DocumentManagerPluginPackage,
// } from '@embedpdf/plugin-document-manager/react';
// import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
// import { ZoomPluginPackage, ZoomMode } from '@embedpdf/plugin-zoom/react';
// import {
//     PagePointerProvider,
//     InteractionManagerPluginPackage,
// } from '@embedpdf/plugin-interaction-manager/react';
// import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/react';
// import { Loader2, PanelLeft } from 'lucide-react';

// import ZoomToolbar from './ZoomToolbar.jsx';
// import TextSelectionMenu from './TextSelectionMenu.jsx';
// import React, { useMemo } from 'react';

// import { SearchPluginPackage } from '@embedpdf/plugin-search/react';
// import { SearchLayer } from '@embedpdf/plugin-search/react';
// import SearchPanel from './SearchPanel.jsx';
// import { Search as SearchIcon } from 'lucide-react';

// import { useState } from 'react';
// import PageNavigation from './PageNavigation.jsx';
// import ThumbnailSidebar from './ThumbnailSidebar.jsx';
// import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/preact';
// import SettingsToolbar from './SettingsToolbar.jsx';
// import { SpreadMode, SpreadPluginPackage } from '@embedpdf/plugin-spread/preact';

// const HeadlessPdfViewer = ({ documentUrl, onExplain }) => {

//     const { engine, isLoading, error } = usePdfiumEngine();

//     const plugins = useMemo(() => [
//         createPluginRegistration(DocumentManagerPluginPackage, {
//             initialDocuments: [{ url: documentUrl }],
//         }),
//         createPluginRegistration(ZoomPluginPackage, {
//             defaultZoomLevel: ZoomMode.FitPage,
//         }),
//         createPluginRegistration(ThumbnailPluginPackage, {
//             width: 120,
//             paddingY: 10,
//         }),
//         createPluginRegistration(SpreadPluginPackage, {
//             defaultSpreadMode: SpreadMode.None,
//         }),
//         createPluginRegistration(SearchPluginPackage),
//         createPluginRegistration(ViewportPluginPackage),
//         createPluginRegistration(ScrollPluginPackage),
//         createPluginRegistration(RenderPluginPackage),
//         createPluginRegistration(ZoomPluginPackage),
//         createPluginRegistration(InteractionManagerPluginPackage),
//         createPluginRegistration(SelectionPluginPackage),
//     ], [documentUrl]);

//     const [searchOpen, setSearchOpen] = useState(false);
//     const [ThumbnailSidebarOpen, setThumbnailSidebarOpen] = useState(false);

//     if (error) {
//         return (
//             <div className="h-full flex items-center justify-center text-sm text-danger px-6 text-center">
//                 Failed to load PDF engine.
//             </div>
//         );
//     }
//     if (isLoading || !engine) {
//         return (
//             <div className="h-full flex items-center justify-center gap-2 text-content-deemphasized">
//                 <Loader2 size={18} className="animate-spin" />
//                 <span className="text-sm">Loading PDF engine...</span>
//             </div>
//         );
//     }

//     return (
//         <div className="relative flex-1 overflow-hidden">

//             <EmbedPDF engine={engine} plugins={plugins}>

//                 {({ activeDocumentId }) =>

//                     activeDocumentId && (

//                         <DocumentContent documentId={activeDocumentId}>

//                             {({ isLoaded }) =>

//                                 isLoaded && (

//                                     <div className="relative flex flex-col h-full w-full">

//                                         <div className="relative px-4 flex items-center border-b border-lines-divider shrink-0">

//                                             <button
//                                                 onClick={() => setThumbnailSidebarOpen((v) => !v)}
//                                                 className={`p-1.5 border rounded hover:bg-surface-emphasized ${ThumbnailSidebarOpen ? "bg-surface-emphasized border-lines-divider" : "bg-transparent border-transparent"} `}
//                                             >
//                                                 <PanelLeft className='size-4' /> 
//                                             </button> 

//                                             <SettingsToolbar documentId={activeDocumentId} />

//                                             <ZoomToolbar documentId={activeDocumentId} /> 

//                                             <button
//                                                 onClick={() => setSearchOpen((v) => !v)}
//                                                 className="p-1.5 rounded hover:bg-surface-emphasized ml-auto"
//                                             >
//                                                 <SearchIcon className="w-4 h-4" />
//                                             </button>

//                                             {searchOpen && (
//                                                 <SearchPanel documentId={activeDocumentId} onClose={() => setSearchOpen(false)} />
//                                             )}

//                                         </div>

//                                         <PageNavigation documentId={activeDocumentId} />

//                                         <div className="relative flex items-stretch flex-1 overflow-hidden" style={{ userSelect: 'none' }} >

//                                             <ThumbnailSidebar documentId={activeDocumentId} open={ThumbnailSidebarOpen} onClose={() => setThumbnailSidebarOpen(false)} />

//                                             <Viewport
//                                                 documentId={activeDocumentId}
//                                                 className="bg-surface-emphasized"
//                                                 style={{ height: '100%', width: '100%' }}
//                                             >
//                                                 <Scroller
//                                                     documentId={activeDocumentId}
//                                                     renderPage={({ pageIndex, scale, width, height }) => (
//                                                         <div style={{ width, height, position: 'relative' }}>
//                                                             <PagePointerProvider
//                                                                 documentId={activeDocumentId}
//                                                                 pageIndex={pageIndex}
//                                                             >
//                                                                 <RenderLayer
//                                                                     documentId={activeDocumentId}
//                                                                     pageIndex={pageIndex}
//                                                                     scale={scale}
//                                                                     className="pointer-events-none"
//                                                                 />
//                                                                 <SelectionLayer
//                                                                     documentId={activeDocumentId}
//                                                                     pageIndex={pageIndex}
//                                                                     selectionMenu={(props) => (
//                                                                         <TextSelectionMenu
//                                                                             {...props}
//                                                                             documentId={activeDocumentId}
//                                                                             onExplain={onExplain}
//                                                                         />
//                                                                     )}
//                                                                 />
//                                                                 <SearchLayer documentId={activeDocumentId} pageIndex={pageIndex} scale={scale} />
//                                                             </PagePointerProvider>
//                                                         </div>
//                                                     )}
//                                                 />
//                                             </Viewport>
//                                         </div>
//                                     </div>
//                                 )
//                             }
//                         </DocumentContent>
//                     )
//                 }
//             </EmbedPDF>
//         </div>
//     );
// }


// export default React.memo(HeadlessPdfViewer); 















import { forwardRef, useImperativeHandle } from 'react';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import { useMemo, useState } from 'react';

import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
import { Scroller, ScrollPluginPackage, useScroll } from '@embedpdf/plugin-scroll/react';
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
import { ZoomPluginPackage, ZoomMode } from '@embedpdf/plugin-zoom/react';
import { PagePointerProvider, InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager/react';
import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/react';
import { SearchPluginPackage, SearchLayer, useSearch } from '@embedpdf/plugin-search/react';
import { Loader2, Search as SearchIcon } from 'lucide-react';

import ZoomToolbar from './ZoomToolbar.jsx';
import PageNavigation from './PageNavigation.jsx';
import SearchPanel from './SearchPanel.jsx';
import TextSelectionMenu from './TextSelectionMenu.jsx';

// Documenta ke andar (jahaँ activeDocumentId available hai) render hota hai.
// jumpToPage/highlightText ko yahaँ define karta hai kyunki useScroll/useSearch
// dono ko documentId chahiye jo sirf isi scope me milta hai.
const ViewerContent = forwardRef(function ViewerContent({ documentId, onExplain }, ref) {
    const { provides: scroll } = useScroll(documentId);
    const { provides: search } = useSearch(documentId);
    const [searchOpen, setSearchOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        jumpToPage: (pageNumber) => {
            scroll?.scrollToPage({ pageNumber });
        },
        highlightText: (text) => {
            if (!search || !text) return;

            // Whitespace normalize karo (newlines/multiple-spaces ek space me) —
            // extraction-pipeline aur PDFium ke text-layer ke beech spacing
            // mismatch se match fail na ho, isliye.
            const cleaned = text.replace(/\s+/g, ' ').trim();
            if (!cleaned) return;

            search.startSearch();
            const task = search.searchAllPages(cleaned);

            // searchAllPages Promise nahi, ek Task hai — result ka wait karna
            // zaroori hai, warna "active hit" kabhi set hi nahi hota aur
            // SearchLayer ko pata hi nahi chalta ki highlight kahaan dikhana hai.
            task?.wait(
                (result) => {
                    if (result?.total > 0) {
                        // Pehla match ko active banao — isse SearchLayer use
                        // activeColor se highlight karta hai, aur agar zaroorat
                        // ho to viewport ko us result ke exact position pe le
                        // jaata hai (page-level scroll se zyada precise).
                        search.goToResult(0);
                    }
                },
                () => {
                    // Search fail/empty — silently ignore, jumpToPage se page
                    // to already sahi dikh raha hoga, bas highlight nahi lagega.
                }
            );
        },
    }), [scroll, search]);

    return (
        <div className="relative flex flex-col h-full w-full">
            <div className="flex items-center border-b border-lines-divider shrink-0">
                <ZoomToolbar documentId={documentId} />
                <button
                    onClick={() => setSearchOpen((v) => !v)}
                    className="p-1.5 rounded hover:bg-surface-emphasized ml-auto mr-2"
                >
                    <SearchIcon className="w-4 h-4" />
                </button>
            </div>

            <PageNavigation documentId={documentId} />

            {searchOpen && (
                <SearchPanel documentId={documentId} onClose={() => setSearchOpen(false)} />
            )}

            <div className="relative flex-1 overflow-hidden" style={{ userSelect: 'none' }}>
                <Viewport documentId={documentId} style={{ height: '100%', width: '100%' }}>
                    <Scroller
                        documentId={documentId}
                        renderPage={({ pageIndex, scale, width, height }) => (
                            <div style={{ width, height, position: 'relative' }}>
                                <PagePointerProvider documentId={documentId} pageIndex={pageIndex}>
                                    <RenderLayer
                                        documentId={documentId}
                                        pageIndex={pageIndex}
                                        scale={scale}
                                        className="pointer-events-none"
                                    />
                                    <SelectionLayer
                                        documentId={documentId}
                                        pageIndex={pageIndex}
                                        selectionMenu={(props) => (
                                            <TextSelectionMenu {...props} documentId={documentId} onExplain={onExplain} />
                                        )}
                                    />
                                    <SearchLayer documentId={documentId} pageIndex={pageIndex} scale={scale} />
                                </PagePointerProvider>
                            </div>
                        )}
                    />
                </Viewport>
            </div>
        </div>
    );
});

const HeadlessPdfViewer = forwardRef(function HeadlessPdfViewer({ documentUrl, onExplain }, ref) {
    const { engine, isLoading, error } = usePdfiumEngine();

    const plugins = useMemo(() => [
        createPluginRegistration(DocumentManagerPluginPackage, {
            initialDocuments: [{ url: documentUrl }],
        }),
        createPluginRegistration(ViewportPluginPackage),
        createPluginRegistration(ScrollPluginPackage),
        createPluginRegistration(RenderPluginPackage),
        createPluginRegistration(ZoomPluginPackage, {
            defaultZoomLevel: ZoomMode.FitPage,
        }),
        createPluginRegistration(InteractionManagerPluginPackage),
        createPluginRegistration(SelectionPluginPackage),
        createPluginRegistration(SearchPluginPackage),
    ], [documentUrl]);

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-danger px-6 text-center">
                Failed to load PDF engine.
            </div>
        );
    }
    if (isLoading || !engine) {
        return (
            <div className="h-full flex items-center justify-center gap-2 text-content-deemphasized">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading PDF engine...</span>
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden">
            <EmbedPDF engine={engine} plugins={plugins}>
                {({ activeDocumentId }) =>
                    activeDocumentId && (
                        <DocumentContent documentId={activeDocumentId}>
                            {({ isLoaded }) =>
                                isLoaded && (
                                    <ViewerContent ref={ref} documentId={activeDocumentId} onExplain={onExplain} />
                                )
                            }
                        </DocumentContent>
                    )
                }
            </EmbedPDF>
        </div>
    );
});

export default HeadlessPdfViewer;