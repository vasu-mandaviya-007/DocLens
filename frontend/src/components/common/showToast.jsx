
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Lock, X, AlertTriangle, Info } from 'lucide-react';

const DRAG_CLOSE_THRESHOLD = 80;

const ToastCard = ({ t, message, activeConfig, showProgress }) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false); 

    const startXRef = useRef(0);
    const draggingRef = useRef(false);
    const cardRef = useRef(null);

    const handlePointerDown = (e) => {
        draggingRef.current = true;
        startXRef.current = e.clientX;
        setIsDragging(true);
        cardRef.current?.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!draggingRef.current) return;
        setDragX(e.clientX - startXRef.current);
    };

    const endDrag = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setIsDragging(false);

        if (Math.abs(dragX) > DRAG_CLOSE_THRESHOLD) {
            toast.dismiss(t.id);
        } else {
            setDragX(0);
        }
    };

    const dragOpacity = Math.max(1 - Math.abs(dragX) / 200, 0.1);
    const duration = t.duration || 4000;

    return (
        // <div className={`${t.visible ? 'animate-bounce-in' : 'animate-fade-out'} max-w-sm w-full`}>
        <div className={`${t.visible ? 'animate-toast-in' : 'animate-toast-out'} max-w-sm w-full`}> 
            <style>
                {`
                    @keyframes shrink-progress {   
                        from { width: 100%; } 
                        to { width: 0%; }
                    }
                `}
            </style>

            <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => {
                    if (draggingRef.current) endDrag();
                    setIsHovered(false);
                }}
                style={{
                    transform: `translateX(${dragX}px)`,
                    opacity: dragOpacity,
                    transition: isDragging ? 'none' : 'transform 0.25s ease, opacity 0.25s ease',
                    touchAction: 'pan-y',
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                className="relative w-full bg-white dark:bg-surface-default shadow-2xl shadow-black/10 rounded-lg pointer-events-auto flex border border-slate-100 dark:border-lines-divider overflow-hidden select-none"
            >
                <div className={`w-1.5 ${activeConfig.accent} shrink-0 relative z-10`} />

                <div className="flex-1 w-0 p-4 relative z-10 bg-white dark:bg-surface-default">
                    <div className="flex items-start gap-3.5">
                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${activeConfig.bg}`}> 
                            {activeConfig.icon}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className={`text-[13px] font-bold tracking-wide ${activeConfig.title}`}>
                                {activeConfig.titleText}
                            </p>
                            <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-content-deemphasized leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex border-l border-slate-100 dark:border-lines-divider relative z-10 bg-white dark:bg-surface-default">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full border border-transparent rounded-none rounded-r-lg px-4 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-content-deemphasized transition-colors focus:outline-none hover:bg-slate-50 dark:hover:bg-surface-highlight"
                    >
                        <X size={16} />
                    </button>
                </div>

                {showProgress && (
                    <div
                        onAnimationEnd={() => toast.dismiss(t.id)}
                        className={`absolute bottom-0 left-0 h-1 ${activeConfig.accent}`}
                        style={{
                            animation: `shrink-progress ${duration}ms linear forwards`,
                            animationPlayState: (isHovered || isDragging) ? 'paused' : 'running',
                            zIndex: 20
                        }}
                    />
                )}
            </div>
        </div>
    );
};


/**
 * Displays a custom toast notification with an optional progress bar.
 * @param {string} message - The message to display.
 * @param {'success' | 'error' | 'warning' | 'info' | 'demo'} [type='success'] - The visual theme of the toast.
 * @param {Object} [options] - Additional configuration options.
 * @param {'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'} [options.position='top-center'] - Screen position.
 * @param {boolean} [options.showProgress=false] - Whether to display the animated progress bar.
 * @param {number} [options.duration=4000] - Time in milliseconds before auto-dismiss.
 */
export const showToast = (message, type = "success", options) => {
    // export const showToast = (message, type = 'success', position = 'top-center', showProgress = true, duration = 4000) => {
    const {
        position = 'top-center',
        showProgress = false,
        duration = 40000
    } = options || {};

    // Failsafe check
    if (!message) return;

    const isDemo = message.includes("Demo Mode");
    const actualType = isDemo ? 'demo' : type; 

    const config = {
        success: { icon: <CheckCircle2 size={18} className="text-emerald-500 dark:text-white" />, bg: 'bg-emerald-50 dark:bg-emerald-400', accent: 'bg-emerald-500', title: 'text-emerald-800 dark:text-emerald-600', titleText: 'Success' },
        error: { icon: <AlertCircle size={18} className="text-rose-500" />, bg: 'bg-rose-50', accent: 'bg-rose-500', title: 'text-rose-800', titleText: 'Error' },
        demo: { icon: <Lock size={18} className="text-amber-500" />, bg: 'bg-amber-50', accent: 'bg-amber-500', title: 'text-amber-800', titleText: 'Access Restricted' },
        warning: { icon: <AlertTriangle size={18} className="text-orange-500" />, bg: 'bg-orange-50', accent: 'bg-orange-500', title: 'text-orange-800', titleText: 'Warning' },
        info: { icon: <Info size={18} className="text-blue-500" />, bg: 'bg-blue-50', accent: 'bg-blue-500', title: 'text-blue-800', titleText: 'Notice' }
    }; 

    const activeConfig = config[actualType] || config.info; 

    toast.custom(
        (t) => <ToastCard t={t} message={message} activeConfig={activeConfig} showProgress={showProgress} />,
        { position, duration }
    );
};



