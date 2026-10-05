import { Plus, Loader2 } from "lucide-react";
import { NotebookListRow, NotebookGridCard, LIST_COLS } from "./NotebookCard.jsx";

export default function NotebookList({ notebooks, view, onNewNotebook, onPin, onEdit, onDelete, creating = false }) {
    
    if (notebooks.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-2xl px-4 py-16 text-center sm:px-8 sm:py-20">
                <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-content-default">
                    No notebooks found
                </h3>
                <p className="mb-5 text-[13px] text-content-deemphasized">
                    Try a different search, or create a new notebook.
                </p>
                <button
                    type="button"
                    onClick={onNewNotebook}
                    disabled={creating}
                    className="flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                    {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    New notebook
                </button>
            </div>
        );
    }

    if (view === "list") {
        return (
            <div className="overflow-hidden rounded-2xl border border-lines-divider">
                {/* Column header sirf desktop pe — mobile pe meta line title ke neeche hi hai */}
                <div className={`hidden md:grid grid-cols-[1fr_110px_130px_40px] gap-x-2 border-b border-lines-divider px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-content-deemphasized`}>
                    <span>Title</span>
                    <span>Pages</span>
                    <span>Created</span>
                    <span></span>
                </div>
                {notebooks.map((n, idx) => (
                    <NotebookListRow
                        key={n.id}
                        notebook={n}
                        isLast={idx === notebooks.length - 1}
                        onEdit={onEdit}
                        onPin={onPin}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {notebooks.map((n) => (
                <NotebookGridCard
                    key={n.id}
                    notebook={n}
                    onPin={onPin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}