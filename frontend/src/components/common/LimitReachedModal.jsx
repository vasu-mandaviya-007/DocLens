// import { useEffect, useState } from "react";
// import { X } from "lucide-react";

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(Date.UTC(
//         now.getUTCFullYear(),
//         now.getUTCMonth(),
//         now.getUTCDate() + 1,
//         0, 0, 0, 0
//     ));
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const totalMinutes = Math.floor(ms / 60000);
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return `${hours}h ${minutes}m`;
// }

// const EXIT_DURATION = 200;
// const RING_SIZE = 96;
// const RING_STROKE = 7;
// const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
// const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// /**
//  * LimitReachedModal
//  * props: open, onClose, limitType ("questions" | "documents"), used, total
//  */
// export default function LimitReachedModal({ open, onClose, limitType = "questions", used, total }) {
//     const [rendered, setRendered] = useState(open);
//     const [visible, setVisible] = useState(false);
//     const [ringFilled, setRingFilled] = useState(false);
//     const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnightUTC()));

//     useEffect(() => {
//         if (open) {
//             setRendered(true);
//             requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
//             const ringTimeout = setTimeout(() => setRingFilled(true), 150);
//             return () => clearTimeout(ringTimeout);
//         } else {
//             setVisible(false);
//             setRingFilled(false);
//             const timeout = setTimeout(() => setRendered(false), EXIT_DURATION);
//             return () => clearTimeout(timeout);
//         }
//     }, [open]);

//     useEffect(() => {
//         if (!rendered) return;
//         const interval = setInterval(() => setCountdown(formatCountdown(getMsUntilMidnightUTC())), 60000);
//         return () => clearInterval(interval);
//     }, [rendered]);

//     useEffect(() => {
//         if (!rendered) return;
//         const handleEsc = (e) => e.key === "Escape" && onClose?.();
//         document.addEventListener("keydown", handleEsc);
//         return () => document.removeEventListener("keydown", handleEsc);
//     }, [rendered, onClose]);

//     if (!rendered) return null;

//     const noun = limitType === "documents" ? "uploads" : "questions";
//     const progress = total > 0 ? used / total : 1;
//     const dashOffset = ringFilled ? RING_CIRCUMFERENCE * (1 - progress) : RING_CIRCUMFERENCE;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//             <div
//                 className={`absolute inset-0 bg-zinc-950/50 backdrop-blur-[3px] transition-opacity duration-200 ease-out ${visible ? "opacity-100" : "opacity-0"
//                     }`}
//                 onClick={onClose}
//             />

//             <div
//                 className={`relative w-full max-w-95 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-zinc-100 dark:border-zinc-800/80 px-8 pt-8 pb-6
//                     transition-all duration-200 ease-out motion-reduce:transition-none
//                     ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]"}`}
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
//                     aria-label="Close"
//                 >
//                     <X className="size-4" />
//                 </button>

//                 {/* Hero: circular ring with the actual number inside it —
//                     the content IS the visual, not a decorative icon standing in for it. */}
//                 <div className="flex justify-center pt-1 pb-5">
//                     <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
//                         <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
//                             <defs>
//                                 <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                                     <stop offset="0%" className="[stop-color:var(--color-brand-primary)]" />
//                                     <stop offset="100%" className="[stop-color:var(--color-brand-secondary)]" />
//                                 </linearGradient>
//                             </defs>
//                             <circle
//                                 cx={RING_SIZE / 2}
//                                 cy={RING_SIZE / 2}
//                                 r={RING_RADIUS}
//                                 fill="none"
//                                 strokeWidth={RING_STROKE}
//                                 className="stroke-zinc-100 dark:stroke-zinc-800"
//                             />
//                             <circle
//                                 cx={RING_SIZE / 2}
//                                 cy={RING_SIZE / 2}
//                                 r={RING_RADIUS}
//                                 fill="none"
//                                 strokeWidth={RING_STROKE}
//                                 strokeLinecap="round"
//                                 stroke="url(#ring-gradient)"
//                                 strokeDasharray={RING_CIRCUMFERENCE}
//                                 strokeDashoffset={dashOffset}
//                                 style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
//                             />
//                         </svg>
//                         <div className="absolute inset-0 flex flex-col items-center justify-center">
//                             <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
//                                 {used}/{total}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Copy — calm, not alarmist */}
//                 <div className="text-center mb-6">
//                     <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
//                         You're all set for today
//                     </h2>
//                     <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
//                         You've used today's {noun}. More open up in {countdown}.
//                     </p>
//                 </div>

//                 {/* Primary action */}
//                 <button
//                     onClick={onClose}
//                     className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-linear-to-br from-brand-primary to-brand-secondary shadow-md shadow-brand-primary/25 hover:shadow-lg hover:shadow-brand-primary/30 active:scale-[0.98] transition-all"
//                 >
//                     Got it
//                 </button>

//                 {/* Secondary — quiet text link, not a disabled button that looks broken */}
//                 <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">
//                     Higher limits with Pro — coming soon
//                 </p>
//             </div>
//         </div>
//     );
// }



















import { useEffect, useState } from "react";
import { X } from "lucide-react";

function getMsUntilMidnightUTC() {
    const now = new Date();
    const midnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
    ));
    return midnight.getTime() - now.getTime();
}

function formatCountdown(ms) {
    if (ms <= 0) return "0h 0m";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

const EXIT_DURATION = 180;
const RING_SIZE = 88;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * LimitReachedModal
 * props: open, onClose, limitType ("questions" | "documents"), used, total
 */
export default function LimitReachedModal({ open, onClose, limitType = "questions", used, total }) {
    const [rendered, setRendered] = useState(open);
    const [visible, setVisible] = useState(false);
    const [ringFilled, setRingFilled] = useState(false);
    const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnightUTC()));

    useEffect(() => {
        if (open) {
            setRendered(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
            const ringTimeout = setTimeout(() => setRingFilled(true), 120);
            return () => clearTimeout(ringTimeout);
        } else {
            setVisible(false);
            setRingFilled(false);
            const timeout = setTimeout(() => setRendered(false), EXIT_DURATION);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    useEffect(() => {
        if (!rendered) return;
        const interval = setInterval(() => setCountdown(formatCountdown(getMsUntilMidnightUTC())), 60000);
        return () => clearInterval(interval);
    }, [rendered]);

    useEffect(() => {
        if (!rendered) return;
        const handleEsc = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [rendered, onClose]);

    if (!rendered) return null;

    const noun = limitType === "documents" ? "uploads" : "questions";
    const progress = total > 0 ? used / total : 1;
    const dashOffset = ringFilled ? RING_CIRCUMFERENCE * (1 - progress) : RING_CIRCUMFERENCE;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            <div
                className={`relative w-full max-w-90 bg-surface-default rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-lines-divider px-7 pt-7 pb-6
                    transition-all duration-200 ease-out motion-reduce:transition-none
                    ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]"}`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-1.5 text-content-deemphasized hover:text-content-default hover:bg-surface-emphasized transition-colors"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </button>

                <div className="flex justify-center pt-1 pb-5">
                    <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
                            <circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RING_RADIUS}
                                fill="none"
                                strokeWidth={RING_STROKE}
                                className="stroke-surface-emphasized"
                            />
                            <circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RING_RADIUS}
                                fill="none"
                                strokeWidth={RING_STROKE}
                                strokeLinecap="round"
                                stroke="var(--color-primary)"
                                strokeDasharray={RING_CIRCUMFERENCE}
                                strokeDashoffset={dashOffset}
                                style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-semibold text-content-default tabular-nums leading-none tracking-[-0.01em]">
                                {used}/{total}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-[16px] font-semibold text-content-default mb-1 tracking-[-0.01em]">
                        You're all set for today
                    </h2>
                    <p className="text-[13px] text-content-deemphasized leading-relaxed">
                        You've used today's {noun}. More open up in {countdown}.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all"
                >
                    Got it
                </button>

                <p className="text-center text-[11px] text-content-deemphasized/70 mt-4">
                    Higher limits with Pro — coming soon
                </p>
            </div>
        </div>
    );
}