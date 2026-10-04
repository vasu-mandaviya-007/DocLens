import { useState, useEffect } from 'react';
import { useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { Copy, Sparkles } from 'lucide-react';

export default function SelectionExplainLayer({ documentId, onExplain }) {
    const { provides: selectionCapability } = useSelectionCapability();
    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        if (!selectionCapability) return;
        const scope = selectionCapability.forDocument(documentId);
        return scope.onSelectionChange((sel) => setHasSelection(!!sel));
    }, [selectionCapability, documentId]);

    if (!hasSelection) return null;

    const handleCopy = () => {
        selectionCapability?.forDocument(documentId).copyToClipboard();
    };

    const handleExplain = async () => {
        const scope = selectionCapability?.forDocument(documentId);
        const text = await scope?.getSelectedText?.();
        const joined = Array.isArray(text) ? text.join(' ').trim() : String(text ?? '').trim();
        if (joined) onExplain?.(joined);
        setHasSelection(false);
    };

    return (
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-xl bg-surface-default border border-lines-divider shadow-lg px-1.5 py-1.5">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-emphasized">
                <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <div className="w-px h-4 bg-lines-divider" />
            <button onClick={handleExplain} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10">
                <Sparkles className="w-3.5 h-3.5" /> Explain
            </button>
        </div>
    );
}