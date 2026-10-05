import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/layout/Header.jsx";
import Toolbar from "../components/notebooks/Toolbar.jsx";
import NotebookList from "../components/notebooks/NotebookList.jsx";
import RenameNotebookModal from "../components/notebooks/RenameNotebookModal.jsx";
import ConfirmDialog from "../components/common/ConfirmModal.jsx";
import { getErrorMessage } from "../apis/authApi.js";
import {
    useNotebooksQuery,
    useCreateNotebook,
    useRenameNotebook,
    useDeleteNotebook,
    usePinNotebook
} from "../hooks/useNotebooks.js";
import { inferFileType } from "../utils/fileType.js";


const SPINE_COLOR_COUNT = 6;

function formatDate(isoString) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
}

function mapNotebook(nb, index) {
    return {
        id: nb.notebook_id,
        title: nb.title,
        pinned: nb.pinned,
        pages: nb.document?.page_count ?? 0,
        date: formatDate(nb.created_at),
        color: index % SPINE_COLOR_COUNT,
        type: inferFileType(nb.document?.filename),
    };
}

export default function Home() {

    const [view, setView] = useState(localStorage.getItem("doc-lens-notebook-view") || "grid");
    const [query, setQuery] = useState("");
    const [editingNotebook, setEditingNotebook] = useState(null);
    const [deletingNotebookId, setDeletingNotebookId] = useState(null);

    const navigate = useNavigate();

    const { data, isLoading, isError, isFetching, refetch } = useNotebooksQuery();

    const createNotebook = useCreateNotebook();
    const renameNotebook = useRenameNotebook();
    const deleteNotebook = useDeleteNotebook();
    const pinNotebook = usePinNotebook();

    const notebooks = useMemo(() => (data ?? []).map(mapNotebook), [data]);

    const filtered = useMemo(() => {
        const result = notebooks.filter((n) =>
            n.title.toLowerCase().includes(query.toLowerCase())
        );
        return [...result].sort((a, b) =>
            a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
        );
    }, [notebooks, query]);

    const handleNewNotebook = () => {
        if (createNotebook.isPending) return;
        createNotebook.mutate(undefined, {
            onSuccess: (res) => {
                const id = res.data?.data?.notebook_id;
                toast.success("Notebook created");
                if (id) navigate(`/notebook/${id}`);
            },
            onError: () => toast.error("Failed to create notebook"),
        });
    };

    const handleRenameSave = async (newTitle) => {
        if (!editingNotebook) return;
        try {
            await renameNotebook.mutateAsync({
                id: editingNotebook.id,
                title: newTitle,
            });
            toast.success("Title edited");
            setEditingNotebook(null);
        } catch (err) {
            toast.error(getErrorMessage(err) || "Could not rename notebook");
        }
    };

    const handlePinNotebook = (notebook) => {
        if (!notebook?.id) return;
        pinNotebook.mutate(notebook.id, {
            onSuccess: (res) => {
                const isPinned = res?.data?.data?.pinned;
                toast.success(isPinned ? "Notebook pinned" : "Notebook unpinned");
            },
            onError: () => toast.error("Could not update pin status"),
        });
    };

    const handleDeleteNotebook = () => {
        if (!deletingNotebookId) return;
        deleteNotebook.mutate(deletingNotebookId, {
            onSuccess: () => {
                toast.success("Notebook deleted");
                setDeletingNotebookId(null);
            },
            onError: (err) => toast.error(getErrorMessage(err) || "Couldn't delete notebook"),
        });
    };

    return (

        <div className="min-h-dvh w-full bg-surface-default transition-colors duration-200">

            <Header />

            <main className="mx-auto max-w-7xl px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">

                <Toolbar
                    query={query}
                    onQueryChange={setQuery}
                    view={view}
                    onViewChange={setView} 
                    onNewNotebook={handleNewNotebook}
                    creating={createNotebook.isPending}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-content-deemphasized/30 border-t-primary" />
                        <p className="text-[13px] text-content-deemphasized">Loading notebooks</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                        <p className="text-[13px] text-content-deemphasized">Couldn't load your notebooks.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="min-h-11 rounded-lg px-4 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            Try again
                        </button>
                    </div>
                ) : (

                    <NotebookList
                        notebooks={filtered}
                        view={view}
                        onNewNotebook={handleNewNotebook}
                        onPin={handlePinNotebook}
                        onEdit={(notebook) => setEditingNotebook(notebook)}
                        onDelete={(notebook_id) => setDeletingNotebookId(notebook_id)}
                        refreshing={isFetching && !isLoading}
                        creating={createNotebook.isPending}
                    />

                )}

            </main>

            <RenameNotebookModal
                open={!!editingNotebook}
                onClose={() => setEditingNotebook(null)}
                notebook={editingNotebook}
                onSave={handleRenameSave}
                saving={renameNotebook.isPending}
            />

            <ConfirmDialog
                open={!!deletingNotebookId}
                title="Delete Notebook"
                confirmText="Delete"
                danger
                onClose={() => setDeletingNotebookId(null)}
                message="This notebook and all of its content will be permanently deleted. This action can't be undone."
                onConfirm={handleDeleteNotebook}
                loading={deleteNotebook.isPending}
            />

        </div>

    );

}








