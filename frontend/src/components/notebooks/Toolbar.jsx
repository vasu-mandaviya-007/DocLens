
// import { useId } from "react";
// import { Search, Plus, Loader2, X } from "lucide-react";
// import { Button } from "@mui/material";
// import ToggleViewButtons from "./ToggleViewButtons.jsx";

// export default function Toolbar({
//     query,
//     onQueryChange,
//     view,
//     onViewChange,
//     onNewNotebook,
//     creating = false,
// }) {

//     const searchId = useId();

//     return (
//         <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//             <div className="px-4 md:px-6 py-2 rounded-full text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
//                 All notebooks
//             </div>

//             <div className="flex flex-wrap items-center gap-3">

//                 <div className="flex relative items-center overflow-hidden rounded-full bg-white dark:bg-surface-emphasized border border-zinc-200 transition-colors [&:hover:not(:focus-within)]:border-lines-outline-deemphasized dark:border-zinc-700  focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/30 ">

//                     <Search className="ml-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />

//                     <label htmlFor={searchId} className="sr-only">
//                         Search notebooks
//                     </label>

//                     <input
//                         id={searchId}
//                         type="text"
//                         value={query}
//                         onChange={(e) => onQueryChange(e.target.value)}
//                         placeholder="Search notebooks"
//                         className="w-50 sm:w-52 lg:w-70 bg-transparent py-2.5 pl-2.5 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
//                     />

//                     <X onClick={() => onQueryChange("")} className={`h-4 w-4 absolute cursor-pointer text-content-deemphasized transition-all duration-200 ${query ? "opacity-100 right-3.5" : "opacity-0 right-1"} `} />

//                 </div>

//                 {/* <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
//                     <button
//                         onClick={() => onViewChange("grid")}
//                         aria-label="Grid view"
//                         className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${view === "grid"
//                             ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
//                             : "text-zinc-500 dark:text-zinc-400"
//                             }`}
//                     >
//                         <LayoutGrid className="w-4 h-4" />
//                     </button>
//                     <button
//                         onClick={() => onViewChange("list")}
//                         aria-label="List view"
//                         className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${view === "list"
//                             ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
//                             : "text-zinc-500 dark:text-zinc-400"
//                             }`}
//                     >
//                         <ListIcon className="w-4 h-4" />
//                     </button>
//                 </div> */}

//                 <ToggleViewButtons view={view} onChange={onViewChange} />

//                 <Button
//                     variant="contained"
//                     loading={creating}
//                     disabled={creating}
//                     onClick={onNewNotebook}
//                     aria-busy={creating}
//                     startIcon={<Plus className="h-4 w-4" />}
//                     loadingIndicator={<Loader2 className="h-4 w-4 animate-spin" />}
//                     loadingPosition="start"
//                     sx={{
//                         borderRadius: "9999px"
//                     }}
//                 >
//                     {creating ? "Creating..." : "New notebook"}
//                 </Button>

//             </div>
//         </div>
//     );
// }








import { useId } from "react";
import { Search, LayoutGrid, List as ListIcon, Plus, Loader2 } from "lucide-react";
import ToggleViewButtons from "../layout/ToggleViewButtons.jsx"
export default function Toolbar({
    query,
    onQueryChange,
    view,
    onViewChange,
    onNewNotebook,
    creating = false,
}) {
    const searchId = useId();

    return (

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

            <h1 className="text-[15px] font-semibold text-content-default tracking-[-0.01em]">
                All notebooks
            </h1>

            <div className="flex flex-wrap items-center gap-2.5">

                <div className="flex items-center overflow-hidden rounded-lg bg-surface-emphasized transition-shadow focus-within:ring-2 focus-within:ring-primary/40">

                    <Search className="ml-3 h-4 w-4 text-content-deemphasized" strokeWidth={2} />

                    <label htmlFor={searchId} className="sr-only">
                        Search notebooks
                    </label>

                    <input
                        id={searchId}
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search"
                        className="w-40 bg-transparent py-2 pl-2 pr-3.5 text-[13px] text-content-default outline-none placeholder:text-content-deemphasized sm:w-52"
                    />
                </div>

                {/* <div className="flex items-center gap-0.5 rounded-lg bg-surface-emphasized p-0.5">
                    
                    <button
                        type="button"
                        onClick={() => onViewChange("grid")}
                        aria-label="Grid view"
                        aria-pressed={view === "grid"}
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            view === "grid"
                                ? "bg-surface-default text-content-default shadow-sm"
                                : "text-content-deemphasized hover:text-content-default"
                        }`}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onViewChange("list")}
                        aria-label="List view"
                        aria-pressed={view === "list"}
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            view === "list"
                                ? "bg-surface-default text-content-default shadow-sm"
                                : "text-content-deemphasized hover:text-content-default"
                        }`}
                    >
                        <ListIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    
                </div> */}

                <ToggleViewButtons view={view} onChange={onViewChange} />

                <button
                    type="button"
                    onClick={onNewNotebook}
                    disabled={creating}
                    aria-busy={creating}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {creating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    )}
                    New notebook
                </button>

            </div>

        </div>

    );

}