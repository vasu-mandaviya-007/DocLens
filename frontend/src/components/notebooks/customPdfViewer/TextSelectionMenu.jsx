import { useState, useEffect } from 'react';
import { useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { ignore } from '@embedpdf/models';
import { Copy, Check, Sparkles } from 'lucide-react';

export default function TextSelectionMenu({ rect, menuWrapperProps, placement, documentId, onExplain }) {
    const { provides: selectionCapability } = useSelectionCapability();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setCopied(false);
    }, [placement]);

    const handleCopy = () => {
        if (!selectionCapability) return;
        const scope = selectionCapability.forDocument(documentId);
        scope.copyToClipboard();
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
        // Copy ke baad selection intentionally clear nahi kar rahे — taaki
        // user Explain bhी usी selection pe click kar sake agar chahe.
    };

    const handleExplain = () => {
        if (!selectionCapability) return;
        const scope = selectionCapability.forDocument(documentId);
        // getSelectedText() Promise nahi, ek Task deता hai — .wait(onSuccess, onError)
        scope.getSelectedText().wait((textLines) => {
            const joined = textLines.join(' ').trim();
            if (joined) {
                onExplain?.(joined);
                scope.clear();
            }
        }, ignore);
    };

    const menuStyle = {
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'default',
    };

    if (placement.suggestTop) {
        menuStyle.top = -44 - 8;
    } else {
        menuStyle.top = rect.size.height + 8;
    }

    return (
        <div {...menuWrapperProps}>
            <div
                style={menuStyle}
                className="rounded-xl border border-lines-divider bg-surface-default shadow-lg"
            >
                <div className="flex items-center gap-1 px-1.5 py-1.5">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-default hover:bg-surface-emphasized transition-colors"
                        title="Copy"
                    >
                        {copied ? (
                            <>
                                <Check size={14} className="text-success" />
                                <span className="text-success">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    {onExplain && (
                        <>
                            <div className="w-px h-4 bg-lines-divider" />
                            <button
                                onClick={handleExplain}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                                title="Explain"
                            >
                                <Sparkles size={14} />
                                <span>Explain</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}