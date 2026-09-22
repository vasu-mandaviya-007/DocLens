import React, { useEffect, useRef, useState } from 'react'
import ThemeToggle from '../layout/ThemeToggle.jsx';
import UserButton from '../layout/UserButton.jsx';
import { ArrowLeft, BookOpen, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { renameNotebook } from '../../apis/notebookApi.js';

const NotebookHeader = ({ title, setTitle, notebook_id }) => { 

    const titleInputRef = useRef(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false); 
    const [titleDraft, setTitleDraft] = useState("");
    
    // ── Title editing ────────────────────────────────────────────────
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.target.blur();
        } else if (e.key === "Escape") {
            setTitleDraft(title);
            setIsEditingTitle(false);
        }
    };

    const handleSaveTitle = async () => {
        const trimmed = titleDraft.trim();
        setIsEditingTitle(false);

        if (!trimmed || trimmed === title) {
            setTitleDraft(title);
            return;
        }

        const previousTitle = title;
        setTitle(trimmed);
        try {
            await renameNotebook(notebook_id, trimmed);
            toast.success("Title updated");
        } catch {
            setTitle(previousTitle);
            toast.error("Could not update title");
        }
    };

    return (

        <header className="flex items-center gap-2 px-3 sm:px-4 h-14 border-b border-b-lines-divider bg-surface-default/80 backdrop-blur-xl shrink-0 z-20 supports-backdrop-blur:bg-surface-default/60">

            <div className="flex items-stretch gap-2 sm:gap-3 shrink-0">

                <Link
                    to="/"
                    className="group flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-surface-emphasized text-content-deemphasized hover:text-content-default transition-all duration-150 text-[13px] font-medium"
                    title="Back to notebooks"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" strokeWidth={2} />
                    <span className="hidden sm:inline">Notebooks</span>
                </Link>

                <div className="w-px h-5 my-auto bg-lines-divider shrink-0" />

                <div className="w-7 h-7 my-auto rounded-lg bg-surface-emphasized flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-content-default" strokeWidth={1.75} />
                </div>

            </div>

            <div className="flex-1 min-w-0 flex items-center px-1">

                {isEditingTitle ? (

                    <div className="flex items-center gap-1.5 w-full max-w-md">

                        <input
                            ref={titleInputRef}
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            onBlur={handleSaveTitle}
                            className="flex-1 min-w-0 text-[15px] font-semibold bg-surface-emphasized outline outline-primary/50 rounded-md px-2.5 py-1 text-content-default"
                            placeholder="Notebook title..."
                        />

                    </div>

                ) : (

                    <button
                        type="button"
                        onClick={() => { setIsEditingTitle(true); setTitleDraft(title); }}
                        title="Click to rename"
                        className="group flex items-center gap-2 min-w-0 max-w-full sm:max-w-sm text-left"
                    >
                        <span className="text-[15px] font-semibold text-content-default truncate tracking-[-0.01em] group-hover:text-primary transition-colors">
                            {title}
                        </span>
                        <span className="shrink-0 hidden sm:flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 bg-surface-emphasized duration-200 transition-opacity">
                            <Pencil className="w-2.5 h-2.5 text-content-deemphasized" />
                        </span>
                    </button>

                )}

            </div>

            <ThemeToggle />

            <UserButton />

        </header>

    )

}

export default NotebookHeader