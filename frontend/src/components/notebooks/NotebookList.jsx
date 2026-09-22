// import { Plus } from "lucide-react";
// import { NotebookListRow, NotebookGridCard } from "./NotebookCard.jsx";
// import toast from "react-hot-toast";
// import { createNotebook } from "../apis/notebookApi.js";
// import { useAppStore } from "../store/appStore.js";
// import { useNavigate } from "react-router-dom"; 

// export default function NotebookList({ notebooks, view, onNewNotebook, onPin, onEdit, onDelete }) {

//     const navigate = useNavigate()
//     const setIsCreatingNotebook = useAppStore(state => state.setIsCreatingNotebook);

//     const handleCreateNotebook = async () => {  

//         try {

//             setIsCreatingNotebook(true)

//             const response = await createNotebook();

//             console.log(response.data);

//             setIsCreatingNotebook(false)
//             navigate(`/notebook/${response.data?.data?.notebook_id}`)

//             toast.success("Notebook Created");

//         } catch (err) {
//             toast.error("Failed to create notebook")
//         } finally {
//             setIsCreatingNotebook(false)
//         }

//     }


//     if (notebooks.length === 0) {

//         return (
//             <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl py-16 px-8 flex flex-col items-start">
//                 <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
//                     No notebooks found
//                 </h3>
//                 <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
//                     Try a different search, or create a new notebook.
//                 </p>
//                 <button
//                     // onClick={onNewNotebook}
//                     onClick={handleCreateNotebook}
//                     className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
//                 >
//                     <Plus className="w-4 h-4" />
//                     New notebook
//                 </button>
//             </div>
//         );
//     }

//     if (view === "list") {
//         return (
//             <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
//                 <div className="grid grid-cols-[1fr_120px_140px_40px] px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
//                     <span>Title</span>
//                     <span>Pages</span>
//                     <span>Created</span>
//                     <span></span>
//                 </div>
//                 {notebooks.map((n, idx) => (
//                     <NotebookListRow
//                         key={n.id}
//                         notebook={n}
//                         isLast={idx === notebooks.length - 1}
//                     />
//                 ))}
//             </div>
//         );
//     }

//     return (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//             {notebooks.map((n) => (
//                 <NotebookGridCard
//                     key={n.id} 
//                     notebook={n} 
//                     onPin={onPin}
//                     onEdit={onEdit}
//                     onDelete={onDelete} 
//                     // onPin={handlePinNotebook}
//                 />
//             ))}
//         </div>
//     );
// }









import { Plus, Loader2 } from "lucide-react";
import { NotebookListRow, NotebookGridCard } from "./NotebookCard.jsx";

export default function NotebookList({ notebooks, view, onNewNotebook, onPin, onEdit, onDelete, creating = false }) {
    if (notebooks.length === 0) {
        return (
            <div className="rounded-2xl py-20 px-8 flex flex-col items-center text-center">
                <h3 className="text-[15px] font-semibold text-content-default mb-1 tracking-[-0.01em]">
                    No notebooks found
                </h3>
                <p className="text-[13px] text-content-deemphasized mb-5">
                    Try a different search, or create a new notebook.
                </p>
                <button
                    type="button"
                    onClick={onNewNotebook}
                    disabled={creating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-primary text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                >
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    New notebook
                </button>
            </div>
        );
    }

    if (view === "list") {
        return (
            <div className="rounded-2xl border border-lines-divider overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_140px_40px] px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-content-deemphasized border-b border-lines-divider">
                    <span>Title</span>
                    <span className="">Pages</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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