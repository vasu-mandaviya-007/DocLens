import { useEffect, useRef, useState } from 'react';
import { useSearch } from '@embedpdf/plugin-search/react';
import { Search as SearchIcon, X, ChevronUp, ChevronDown } from 'lucide-react';

const DEBOUNCE_MS = 250;

export default function SearchPanel({ documentId, onClose }) {
    const { state, provides: search } = useSearch(documentId);
    const [draft, setDraft] = useState('');
    const inputRef = useRef(null); 

    useEffect(() => {
        inputRef.current?.focus();
        search?.startSearch();
        return () => search?.stopSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        if (!search) return;
        if (!draft.trim()) return;
        const id = setTimeout(() => {
            search.searchAllPages(draft); 
        }, DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [draft, search]);

    if (!search) return null;

    const { total, activeResultIndex, loading } = state;

    return (
        <div className="absolute top-[calc(100%+5px)] w-9/10 left-1/2 -translate-x-1/2 rounded-md popover-menu origin-top! z-10 flex items-center gap-2 px-3 py-2 border-b border-lines-divider shrink-0 bg-surface-default">
            <SearchIcon className="w-4 h-4 text-content-deemphasized shrink-0" />
            <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.shiftKey ? search.previousResult() : search.nextResult();
                    }
                }}
                placeholder="Search in document..."
                className="flex-1 bg-transparent outline-none text-sm text-content-default placeholder:text-content-deemphasized"
            />
            {loading && <span className="text-xs text-content-deemphasized shrink-0">Searching...</span>}
            {!loading && draft.trim() && (
                <span className="text-xs text-content-deemphasized tabular-nums shrink-0">
                    {total > 0 ? `${activeResultIndex + 1}/${total}` : 'No results'}
                </span>
            )}
            {total > 1 && (
                <>
                    <button onClick={() => search.previousResult()} className="p-1 rounded hover:bg-surface-emphasized shrink-0" title="Previous">
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => search.nextResult()} className="p-1 rounded hover:bg-surface-emphasized shrink-0" title="Next">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-surface-emphasized shrink-0" title="Close search">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}