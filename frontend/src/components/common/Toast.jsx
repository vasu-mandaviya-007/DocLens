import { CheckCircle2, XCircle, Loader2, Info, X } from "lucide-react";
import toast from "react-hot-toast";

const VARIANT_CONFIG = {
    success: {
        Icon: CheckCircle2,
        iconClass: "text-emerald-600 dark:text-emerald-500",
    },
    error: {
        Icon: XCircle,
        iconClass: "text-red-600 dark:text-red-500",
    },
    loading: {
        Icon: Loader2,
        iconClass: "text-zinc-500 dark:text-zinc-400 animate-spin",
    },
    info: {
        Icon: Info, 
        iconClass: "text-zinc-500 dark:text-zinc-400", 
    },
};

export default function Toast({ t, variant = "info", title, description }) {
    const { Icon, iconClass } = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;

    return ( 
        <div
            className={`
                ${t.visible ? "animate-toast-in" : "animate-toast-out"}
                w-90 max-w-[calc(100vw-2rem)]
                bg-white dark:bg-surface-emphasized
                border border-zinc-200 dark:border-zinc-800  
                rounded-lg shadow-sm
                px-4 py-3.5
                flex items-start gap-3
            `}
        >
            <Icon className={`size-5 shrink-0 mt-0.5 ${iconClass}`} strokeWidth={2} />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                    {title}
                </p>
                {description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        {description}
                    </p>
                )}
            </div>

            {variant !== "loading" && (
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}