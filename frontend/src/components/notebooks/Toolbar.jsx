import { useId } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import ToggleViewButtons from "../layout/ToggleViewButtons.jsx"


const Toolbar = ({ query, onQueryChange, view, onViewChange, onNewNotebook, creating = false, }) => {
    
    const searchId = useId();

    return (

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

            <h1 className="text-[15px] font-semibold text-content-default tracking-[-0.01em]">
                All notebooks
            </h1>

            <div className="order-3 flex w-full items-center gap-3 sm:order-2 sm:ml-auto sm:w-auto">

                <div className="flex w-full items-center overflow-hidden rounded-lg bg-surface-emphasized transition-shadow focus-within:ring-2 focus-within:ring-primary/40">

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
                        className="w-full lg:w-72 bg-transparent py-2 pl-2 pr-3.5 text-[13px] text-content-default outline-none placeholder:text-content-deemphasized sm:w-52"
                    />
                </div>

                {/* <div className="relative flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-zinc-200 bg-white transition-colors focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/30 sm:flex-none dark:border-zinc-700 dark:bg-surface-emphasized [&:hover:not(:focus-within)]:border-lines-outline-deemphasized">

                    <Search className="pointer-events-none ml-3.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />

                    <label htmlFor={searchId} className="sr-only">
                        Search notebooks
                    </label>

                    <input
                        id={searchId}
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search notebooks"
                        className="min-w-0 flex-1 bg-transparent py-2 pr-10 pl-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 sm:w-52 sm:flex-none sm:text-sm lg:w-70 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                    />

                    <button
                        type="button"
                        onClick={() => onQueryChange("")}
                        aria-label="Clear search"
                        tabIndex={query ? 0 : -1}
                        className={`absolute right-1 flex h-9 w-9 items-center justify-center rounded-full text-content-deemphasized transition-opacity duration-200 hover:text-content-default ${query ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div> */}

                <div className="shrink-0">
                    <ToggleViewButtons view={view} onChange={onViewChange} />
                </div>

            </div>

            <div className="order-2 ml-auto shrink-0 sm:order-3 sm:ml-0">

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

export default Toolbar;