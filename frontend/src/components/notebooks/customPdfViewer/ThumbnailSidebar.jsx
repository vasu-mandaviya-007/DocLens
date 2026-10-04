import { useScroll } from '@embedpdf/plugin-scroll/react';
import { ThumbImg, ThumbnailsPane } from "@embedpdf/plugin-thumbnail/react"
import { useEffect, useRef } from 'react';

export default function ThumbnailSidebar({ documentId, open, onClose }) {

    const { provides: scroll, state } = useScroll(documentId); 

    if (!documentId) return null;
    if (!scroll) return null;
    const panelRef = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div ref={panelRef} className={`absolute ${open ? "translate-x-0" : "-translate-x-full"} duration-200 z-20 h-full w-40 shrink-0 border-r border-lines-divider bg-surface-default`}>

            <ThumbnailsPane documentId={documentId}> 

                {(m) => {
                    const isActive = state.currentPage === m.pageIndex + 1
                    return (
                        <div
                            key={m.pageIndex}
                            className="absolute flex w-full cursor-pointer flex-col items-center px-2"
                            style={{
                                height: m.wrapperHeight,
                                top: m.top,
                            }}
                            onClick={() => {
                                scroll?.scrollToPage?.({
                                    pageNumber: m.pageIndex + 1,
                                })
                            }}
                        >
                            {/* Thumbnail image container */}
                            <div
                                className={`overflow-hidden rounded-md transition-all ${isActive
                                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900'
                                    : 'ring-1 ring-gray-300 hover:ring-gray-400 dark:ring-gray-700 dark:hover:ring-gray-600'
                                    } `}
                                style={{
                                    width: m.width,
                                    height: m.height,
                                }}
                            >
                                <ThumbImg
                                    documentId={documentId}
                                    meta={m}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            {/* Page number label */}
                            <div
                                className="mt-1 flex items-center justify-center"
                                style={{ height: m.labelHeight }}
                            >
                                <span
                                    className={`text-xs font-medium ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-300'
                                        } `}
                                >
                                    {m.pageIndex + 1}
                                </span>
                            </div>
                        </div>
                    )
                }}
            </ThumbnailsPane>
        </div>
    )
}
