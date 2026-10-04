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















// import { forwardRef, useImperativeHandle } from 'react';
// import { createPluginRegistration } from '@embedpdf/core';
// import { EmbedPDF } from '@embedpdf/core/react';
// import { usePdfiumEngine } from '@embedpdf/engines/react';
// import { useMemo, useState } from 'react';

// import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
// import { Scroller, ScrollPluginPackage, useScroll } from '@embedpdf/plugin-scroll/react';
// import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react';
// import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
// import { ZoomPluginPackage, ZoomMode } from '@embedpdf/plugin-zoom/react';
// import { PagePointerProvider, InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager/react';
// import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/react';
// import { SearchPluginPackage, SearchLayer, useSearch } from '@embedpdf/plugin-search/react';
// import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/preact';
// import { SpreadMode, SpreadPluginPackage } from '@embedpdf/plugin-spread/preact';
// import { Loader, Loader2, PanelLeft, Search as SearchIcon } from 'lucide-react';

// import ZoomToolbar from './ZoomToolbar.jsx';
// import SettingsToolbar from './SettingsToolbar.jsx'; 
// import PageNavigation from './PageNavigation.jsx';
// import SearchPanel from './SearchPanel.jsx';
// import TextSelectionMenu from './TextSelectionMenu.jsx';
// import ThumbnailSidebar from './ThumbnailSidebar.jsx';
// import removeMarkdown from '../../../utils/removeMarkdown.js'; 



// const ViewerContent = forwardRef(function ViewerContent({ documentId, onExplain }, ref) {

//     const { provides: scroll } = useScroll(documentId);
//     const { provides: search } = useSearch(documentId);

//     const [searchOpen, setSearchOpen] = useState(false);
//     const [ThumbnailSidebarOpen, setThumbnailSidebarOpen] = useState(false);



//     useImperativeHandle(ref, () => ({ 

//         jumpToPage: (pageNumber) => {
//             scroll?.scrollToPage({ pageNumber }); 
//         },

//         // MAIN HIGHLIGHT FUNCTION

//         highlightText: (text) => {
//             if (!search || !text) return;

//             // const cleanText = text.replace(/\s+/g, ' ').trim();

//             // Remove tag 
//             const cleanText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

//             // const cleanText = text
//             //     .replace(/[^\w\s]/gi, ' ') // Special chars ko spaces banao
//             //     .replace(/\s+/g, ' ')      // Extra spaces hatao
//             //     .trim();

//             if (!cleanText) return;

//             console.log(cleanText);

//             search.startSearch();
//             const task = search.searchAllPages(cleanText);

//             // searchAllPages Promise nahi, ek Task hai — result ka wait karna
//             // zaroori hai, warna "active hit" kabhi set hi nahi hota aur
//             // SearchLayer ko pata hi nahi chalta ki highlight kahaan dikhana hai.
//             task?.wait(
//                 (result) => {
//                     if (result?.total > 0) {
//                         // Pehla match ko active banao — isse SearchLayer use
//                         // activeColor se highlight karta hai, aur agar zaroorat
//                         // ho to viewport ko us result ke exact position pe le
//                         // jaata hai (page-level scroll se zyada precise).
//                         search.goToResult(0);
//                     }
//                 },
//                 () => {
//                     // Search fail/empty — silently ignore, jumpToPage se page
//                     // to already sahi dikh raha hoga, bas highlight nahi lagega.
//                 }
//             );
//         },





//         // highlightText: (text) => {
//         //     if (!search || !text) return;

//         //     const cleanText = text.replace(/\s+/g, ' ').trim();
//         //     const wordsArray = cleanText.split(' ').filter(Boolean);
//         //     if (wordsArray.length === 0) return;

//         //     // Phrases ko thoda bada rakhte hain (8 words) taaki highlight clearly dikhe
//         //     const phraseLength = 8;
//         //     const phrasesToSearch = [];

//         //     for (let i = 0; i < wordsArray.length; i += phraseLength) {
//         //         const phrase = wordsArray.slice(i, i + phraseLength).join(' ');
//         //         if (phrase.trim().length > 3) {
//         //             phrasesToSearch.push(phrase);
//         //         }
//         //     }

//         //     // Recursive function jo tab tak chalega jab tak pehla successful match nahi milta
//         //     const trySearch = (index) => {
//         //         if (index >= phrasesToSearch.length) return; // Sab fail ho gaye toh ruk jao

//         //         search.startSearch();
//         //         const task = search.searchAllPages(phrasesToSearch[index]);

//         //         task?.wait(
//         //             (result) => {
//         //                 if (result?.total > 0) {
//         //                     // MATCH MIL GAYA! Yahan scroll karo aur yellow highlight kardo
//         //                     search.goToResult(0);
//         //                     // 🛑 YAHAN RUK JAO - Agla phrase search nahi karenge taaki highlight yahi rahe
//         //                 } else {
//         //                     // Agar ye phrase match nahi hua (PDF bullets wagera ki wajah se), toh agla try karo
//         //                     trySearch(index + 1);
//         //                 }
//         //             },
//         //             () => {
//         //                 // Error aaya toh agla try karo
//         //                 trySearch(index + 1);
//         //             }
//         //         );
//         //     };

//         //     // Search loop start karo
//         //     trySearch(0);
//         // },





//         // highlightText: (text) => {
//         //     if (!search || !text) return;
//         //     console.log(removeMarkdown(text));
//         //     console.log(text);


//         //     const cleanText = text.replace(/\s+/g, ' ').trim(); 
//         //     // const cleanText = text
//         //     //     .replace(/[^\w\s]/gi, ' ') // Special chars ko spaces banao
//         //     //     .replace(/\s+/g, ' ')      // Extra spaces hatao
//         //     //     .trim();
//         //     if (!cleanText) return;

//         //     // console.log(cleanText);

//         //     search.startSearch();
//         //     const task = search.searchAllPages(cleanText);

//         //     // searchAllPages Promise nahi, ek Task hai — result ka wait karna
//         //     // zaroori hai, warna "active hit" kabhi set hi nahi hota aur
//         //     // SearchLayer ko pata hi nahi chalta ki highlight kahaan dikhana hai.
//         //     task?.wait(
//         //         (result) => {
//         //             if (result?.total > 0) {
//         //                 // Pehla match ko active banao — isse SearchLayer use
//         //                 // activeColor se highlight karta hai, aur agar zaroorat
//         //                 // ho to viewport ko us result ke exact position pe le
//         //                 // jaata hai (page-level scroll se zyada precise).
//         //                 search.goToResult(0);
//         //             }
//         //         },
//         //         () => {
//         //             // Search fail/empty — silently ignore, jumpToPage se page
//         //             // to already sahi dikh raha hoga, bas highlight nahi lagega.
//         //         }
//         //     );
//         // },




//         // highlightText: (rawText) => {
//         //     if (!search || !rawText) return;

//         //     // 1. Text ko lines mein todenge (Newlines ya Markdown bullets ke base par)
//         //     // Ye list items ko alag-alag lines mein baat dega taaki hum bullets skip kar sakein
//         //     const lines = rawText.split(/\n|(?=\*|-|\d+\.)/);

//         //     // 2. Sabse pehli aisi line dhoondho jisme kam se kam 4-5 words hon (Valid sentence)
//         //     let validSentence = "";
//         //     for (const line of lines) {
//         //         const clean = line.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();
//         //         if (clean.split(' ').length > 4) {
//         //             validSentence = clean;
//         //             break; // Jaise hi pehli achi line mile, ruk jao (taaki highlight upar ho)
//         //         }
//         //     }
//         //     console.log(validSentence);


//         //     // Agar koi bohot hi lamba paragraph hai, toh sirf shuru ke 12 words lo
//         //     // Kyunki lamba text PDF mein kisi hidden newline se toot sakta hai
//         //     const finalSearchQuery = validSentence.split(' ').slice(0, 12).join(' ');

//         //     if (!finalSearchQuery) return;

//         //     // 3. Search and Highlight
//         //     search.startSearch();
//         //     const task = search.searchAllPages(finalSearchQuery);

//         //     task?.wait(
//         //         (result) => {
//         //             if (result?.total > 0) {
//         //                 search.goToResult(0); // Perfect jump!
//         //             }
//         //         },
//         //         () => {
//         //             // Fail silently
//         //         }
//         //     );
//         // },


//     }), [scroll, search]);

//     return (

//         <div className="relative flex flex-col h-full w-full">

//             <div className="relative px-4 flex items-center border-b border-lines-divider shrink-0">

//                 <button
//                     onClick={() => setThumbnailSidebarOpen((v) => !v)}
//                     className={`p-1.5 border rounded hover:bg-surface-emphasized ${ThumbnailSidebarOpen ? "bg-surface-emphasized border-lines-divider" : "bg-transparent border-transparent"} `}
//                 >
//                     <PanelLeft className='size-4' />
//                 </button>

//                 <SettingsToolbar documentId={documentId} />

//                 <ZoomToolbar documentId={documentId} />

//                 <button
//                     onClick={() => setSearchOpen((v) => !v)}
//                     className="p-1.5 rounded hover:bg-surface-emphasized ml-auto"
//                 >
//                     <SearchIcon className="w-4 h-4" />
//                 </button>

//                 {searchOpen && (
//                     <SearchPanel documentId={documentId} onClose={() => setSearchOpen(false)} />
//                 )}

//             </div>

//             <PageNavigation documentId={documentId} />

//             <div className="relative flex-1 flex items-stretch overflow-hidden" style={{ userSelect: 'none' }}>

//                 <ThumbnailSidebar documentId={documentId} open={ThumbnailSidebarOpen} onClose={() => setThumbnailSidebarOpen(false)} />

//                 <Viewport
//                     documentId={documentId}
//                     className="bg-surface-emphasized"
//                     style={{ height: '100%', width: '100%' }}
//                 >

//                     <Scroller
//                         documentId={documentId}
//                         renderPage={({ pageIndex, scale, width, height }) => (
//                             <div style={{ width, height, position: 'relative' }}>
//                                 <PagePointerProvider documentId={documentId} pageIndex={pageIndex}>
//                                     <RenderLayer
//                                         documentId={documentId}
//                                         pageIndex={pageIndex}
//                                         scale={scale}
//                                         className="pointer-events-none"
//                                     />
//                                     <SelectionLayer
//                                         documentId={documentId}
//                                         pageIndex={pageIndex}
//                                         selectionMenu={(props) => (
//                                             <TextSelectionMenu {...props} documentId={documentId} onExplain={onExplain} />
//                                         )}
//                                     />
//                                     <SearchLayer documentId={documentId} pageIndex={pageIndex} scale={scale} />
//                                 </PagePointerProvider>
//                             </div>
//                         )}
//                     />
//                 </Viewport>
//             </div>
//         </div>
//     );
// });

// const HeadlessPdfViewer = forwardRef(function HeadlessPdfViewer({ documentUrl, onExplain }, ref) {
//     const { engine, isLoading, error } = usePdfiumEngine();

//     const plugins = useMemo(() => [
//         createPluginRegistration(DocumentManagerPluginPackage, {
//             initialDocuments: [{ url: documentUrl }],
//         }),
//         createPluginRegistration(ViewportPluginPackage),
//         createPluginRegistration(ScrollPluginPackage),
//         createPluginRegistration(RenderPluginPackage),
//         createPluginRegistration(ZoomPluginPackage, {
//             defaultZoomLevel: ZoomMode.FitWidth,
//         }),
//         createPluginRegistration(ThumbnailPluginPackage, {
//             width: 120,
//             paddingY: 10,
//         }),
//         createPluginRegistration(SpreadPluginPackage, {
//             defaultSpreadMode: SpreadMode.None,
//         }),
//         createPluginRegistration(InteractionManagerPluginPackage),
//         createPluginRegistration(SelectionPluginPackage),
//         createPluginRegistration(SearchPluginPackage),
//     ], [documentUrl]);

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

//             <style>
//                 {`
//                     @keyframes gap-move {
//                         0%, 100% { gap: 2px; }
//                         50% { gap: 8px; }
//                     }

//                 `}
//             </style>

//             <EmbedPDF engine={engine} plugins={plugins}>

//                 {({ activeDocumentId }) =>

//                     activeDocumentId && (

//                         <DocumentContent documentId={activeDocumentId}>

//                             {({ isLoaded }) =>

//                                 isLoaded ? (
//                                     <ViewerContent ref={ref} documentId={activeDocumentId} onExplain={onExplain} />
//                                 ) : (
//                                     <div className='flex flex-col items-center justify-center h-full'>
//                                         <div className='animate-spin absolute mb-20'>
//                                             <div className='will-change-auto backface-hidden visible animate-(--my-gap-anim) grid grid-cols-2 grid-rows-2 gap-1 ' style={{ "--my-gap-anim": "gap-move 1.5s infinite" }} >
//                                                 <div className='bg-primary rounded-full h-2 w-2'></div>
//                                                 <div className='bg-primary/90 rounded-full h-2 w-2'></div>
//                                                 <div className='bg-primary/80 rounded-full h-2 w-2'></div>
//                                                 <div className='bg-primary/70 rounded-full h-2 w-2'></div>
//                                             </div>
//                                         </div>
//                                         <p className='text-content-deemphasized animate-pulse'>Loading...</p>
//                                     </div>
//                                 )
//                             }
//                         </DocumentContent>
//                     )
//                 }
//             </EmbedPDF>

//         </div>
//     );
// });

// export default HeadlessPdfViewer;



























import { forwardRef, useEffect, useImperativeHandle } from 'react';
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
import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/preact';
import { SpreadMode, SpreadPluginPackage } from '@embedpdf/plugin-spread/preact';
import { Loader2, PanelLeft, Search as SearchIcon } from 'lucide-react';

import ZoomToolbar from './ZoomToolbar.jsx';
import SettingsToolbar from './SettingsToolbar.jsx';
import PageNavigation from './PageNavigation.jsx';
import SearchPanel from './SearchPanel.jsx';
import TextSelectionMenu from './TextSelectionMenu.jsx';
import ThumbnailSidebar from './ThumbnailSidebar.jsx';
import removeMarkdown from '../../../utils/removeMarkdown.js';


const ViewerContent = forwardRef(function ViewerContent({ documentId, onExplain, onReady }, ref) {

    const { provides: scroll } = useScroll(documentId);
    const { provides: search } = useSearch(documentId);

    const [searchOpen, setSearchOpen] = useState(false);
    const [ThumbnailSidebarOpen, setThumbnailSidebarOpen] = useState(false);

    // Document load ho gaya AUR scroll/search plugins tayyar hain: ab jump/highlight kaam karega.
    // Isse pehle citation-click ka jump chalta to scroll/search null hone se chup-chaap gir jata tha.
    useEffect(() => {
        if (scroll && search) onReady?.();
    }, [scroll, search, onReady]);

    useImperativeHandle(ref, () => ({

        jumpToPage: (pageNumber) => {
            scroll?.scrollToPage({ pageNumber });
        },

        // MAIN HIGHLIGHT FUNCTION
        highlightText: (text) => {
            if (!search || !text) return;

            // HTML tags hatao aur whitespace normalize karo
            const cleanText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (!cleanText) return;

            search.startSearch();
            const task = search.searchAllPages(cleanText);

            // searchAllPages Promise nahi, ek Task hai: result ka wait karna zaroori hai,
            // warna "active hit" kabhi set hi nahi hota aur SearchLayer ko pata nahi chalta
            // ki highlight kahaan dikhana hai.
            task?.wait(
                (result) => {
                    if (result?.total > 0) {
                        // Pehla match active banao: SearchLayer use activeColor se highlight karta hai
                        // aur viewport ko us result ki exact position pe le jata hai.
                        search.goToResult(0);
                    }
                },
                () => {
                    // Search fail/empty: chup-chaap, jumpToPage se page to sahi dikh raha hoga.
                }
            );
        },

    }), [scroll, search]);

    return (

        <div className="relative flex flex-col h-full w-full">

            <div className="relative px-4 flex items-center border-b border-lines-divider shrink-0">

                <button
                    onClick={() => setThumbnailSidebarOpen((v) => !v)}
                    className={`p-1.5 border rounded hover:bg-surface-emphasized ${ThumbnailSidebarOpen ? "bg-surface-emphasized border-lines-divider" : "bg-transparent border-transparent"} `}
                >
                    <PanelLeft className='size-4' />
                </button>

                <SettingsToolbar documentId={documentId} />

                <ZoomToolbar documentId={documentId} />

                <button
                    onClick={() => setSearchOpen((v) => !v)}
                    className="p-1.5 rounded hover:bg-surface-emphasized ml-auto"
                >
                    <SearchIcon className="w-4 h-4" />
                </button>

                {searchOpen && (
                    <SearchPanel documentId={documentId} onClose={() => setSearchOpen(false)} />
                )}

            </div>

            <PageNavigation documentId={documentId} />

            <div className="relative flex-1 flex items-stretch overflow-hidden" style={{ userSelect: 'none' }}>

                <ThumbnailSidebar documentId={documentId} open={ThumbnailSidebarOpen} onClose={() => setThumbnailSidebarOpen(false)} />

                <Viewport
                    documentId={documentId}
                    className="bg-surface-emphasized"
                    style={{ height: '100%', width: '100%' }}
                >

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

const HeadlessPdfViewer = forwardRef(function HeadlessPdfViewer({ documentUrl, onExplain, onReady }, ref) {
    const { engine, isLoading, error } = usePdfiumEngine();

    const plugins = useMemo(() => [
        createPluginRegistration(DocumentManagerPluginPackage, {
            initialDocuments: [{ url: documentUrl }],
        }),
        createPluginRegistration(ViewportPluginPackage),
        createPluginRegistration(ScrollPluginPackage),
        createPluginRegistration(RenderPluginPackage),
        createPluginRegistration(ZoomPluginPackage, {
            defaultZoomLevel: ZoomMode.FitWidth,
        }),
        createPluginRegistration(ThumbnailPluginPackage, {
            width: 120,
            paddingY: 10,
        }),
        createPluginRegistration(SpreadPluginPackage, {
            defaultSpreadMode: SpreadMode.None,
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

            <style>
                {`
                    @keyframes gap-move {
                        0%, 100% { gap: 2px; }
                        50% { gap: 8px; }
                    }
                `}
            </style>

            <EmbedPDF engine={engine} plugins={plugins}>

                {({ activeDocumentId }) =>

                    activeDocumentId && (

                        <DocumentContent documentId={activeDocumentId}>

                            {({ isLoaded }) =>

                                isLoaded ? (
                                    <ViewerContent ref={ref} documentId={activeDocumentId} onExplain={onExplain} onReady={onReady} />
                                ) : (
                                    <div className='flex flex-col items-center justify-center h-full'>
                                        <div className='animate-spin absolute mb-20'>
                                            <div className='will-change-auto backface-hidden visible animate-(--my-gap-anim) grid grid-cols-2 grid-rows-2 gap-1 ' style={{ "--my-gap-anim": "gap-move 1.5s infinite" }} >
                                                <div className='bg-primary rounded-full h-2 w-2'></div>
                                                <div className='bg-primary/90 rounded-full h-2 w-2'></div>
                                                <div className='bg-primary/80 rounded-full h-2 w-2'></div>
                                                <div className='bg-primary/70 rounded-full h-2 w-2'></div>
                                            </div>
                                        </div>
                                        <p className='text-content-deemphasized animate-pulse'>Loading...</p>
                                    </div>
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
