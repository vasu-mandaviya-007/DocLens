import { useEffect, useState } from 'react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PageNavigation({ documentId }) {
    const { provides: scroll, state } = useScroll(documentId);
    const [pageInput, setPageInput] = useState(String(state.currentPage));

    useEffect(() => {
        setPageInput(String(state.currentPage));
    }, [state.currentPage]);

    if (!scroll) return null;

    const handleGoToPage = (e) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInput, 10);
        if (pageNumber >= 1 && pageNumber <= state.totalPages) {
            scroll.scrollToPage({ pageNumber });
        } else {
            // Invalid input — reset back to current page instead of leaving a stale number
            setPageInput(String(state.currentPage));
        }
    };

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 bg-surface-default rounded-lg flex items-center justify-center gap-1.5 px-2 py-1.5 border border-lines-divider shrink-0">

            <button
                onClick={() => scroll.scrollToPreviousPage()}
                disabled={state.currentPage <= 1}
                className="p-1 rounded hover:bg-surface-emphasized disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={handleGoToPage}
                    min={1}
                    max={state.totalPages}
                    className="w-11 h-7 text-center text-xs font-medium tabular-nums rounded-md border border-lines-divider bg-surface-emphasized text-content-default outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-content-deemphasized shrink-0">
                    of {state.totalPages}
                </span>
            </form>

            <button
                onClick={() => scroll.scrollToNextPage()}
                disabled={state.currentPage >= state.totalPages}
                className="p-1 rounded hover:bg-surface-emphasized disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}