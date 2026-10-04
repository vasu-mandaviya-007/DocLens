// import { useZoom } from '@embedpdf/plugin-zoom/react';
// import { ZoomIn, ZoomOut } from 'lucide-react';

// export default function ZoomToolbar({ documentId }) {
//     const { provides: zoom, state: zoomState } = useZoom(documentId);

//     if (!zoom) return null;

//     return (
//         <div className="flex items-center gap-2 px-3 py-2 border-b border-lines-divider shrink-0">
//             <button onClick={() => zoom.zoomOut()} className="p-1.5 rounded hover:bg-surface-emphasized">
//                 <ZoomOut className="w-4 h-4" />
//             </button>
//             <span className="text-xs font-medium text-content-deemphasized tabular-nums w-12 text-center">
//                 {Math.round(zoomState.currentZoomLevel * 100)}%
//             </span>
//             <button onClick={() => zoom.zoomIn()} className="p-1.5 rounded hover:bg-surface-emphasized">
//                 <ZoomIn className="w-4 h-4" />
//             </button>
//         </div>
//     );
// }






import { useZoom, ZoomMode } from '@embedpdf/plugin-zoom/react';
import { ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PRESETS = [
    { label: 'Fit Page', value: ZoomMode.FitPage },
    { label: 'Fit Width', value: ZoomMode.FitWidth },
    { label: '50%', value: 0.5 },
    { label: '100%', value: 1.0 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2.0 },
];

export default function ZoomToolbar({ documentId }) {
    const { provides: zoom, state: zoomState } = useZoom(documentId);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null); 

    useEffect(() => {
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    if (!zoom) return null;

    return (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-lines-divider shrink-0">
            <button onClick={() => zoom.zoomOut()} className="p-1.5 rounded hover:bg-surface-emphasized">
                <ZoomOut className="w-4 h-4" />
            </button>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-content-default hover:bg-surface-emphasized tabular-nums"
                >
                    {Math.round(zoomState.currentZoomLevel * 100)}%
                    <ChevronDown className="w-3 h-3" />
                </button>

                {menuOpen && (
                    <div className="absolute top-full left-0 mt-1 z-30 rounded-lg border border-lines-divider bg-surface-default shadow-lg py-1 min-w-32">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    zoom.requestZoom(preset.value);
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-content-default hover:bg-surface-emphasized"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={() => zoom.zoomIn()} className="p-1.5 rounded hover:bg-surface-emphasized">
                <ZoomIn className="w-4 h-4" />
            </button>
        </div>
    );
}