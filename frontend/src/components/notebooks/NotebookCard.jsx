import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EllipsisVertical, PinOff } from "lucide-react";
import { pinIcon, deleteIcon, editIcon, unPinIcon } from "../common/Icons.jsx";
import { docsFileIcon, noteIcon, pdfFileIcon } from "../../assets/assets.js";

import { IconButton } from "@mui/material";
import DropdownMenu from "../common/DropdownMenu.jsx";


const SPINE_COLORS = [
    "bg-indigo-500",
    "bg-orange-500",
    "bg-emerald-600",
    "bg-fuchsia-600",
    "bg-amber-500",
    "bg-teal-600",
];

const CARD_BG_COLORS = [
    "bg-indigo-50/50",
    "bg-red-50/50",
    "bg-emerald-50/50",
    "bg-fuchsia-50/50",
    "bg-yellow-50/50",
    "bg-teal-50/50",
];

export function getSpineColor(colorIndex) {
    return SPINE_COLORS[colorIndex % SPINE_COLORS.length];
}

export function getBgColor(colorIndex) {
    return CARD_BG_COLORS[colorIndex % CARD_BG_COLORS.length];
}

export function NotebookListRow({ notebook, isLast }) {

    const navigate = useNavigate();

    const isPinned = notebook?.pinned || false;

    const menuItems = [
        { id: "edit", label: "Edit title", icon: editIcon, onClick: () => onEdit?.(notebook) },
        { id: "pin", label: isPinned ? "Unpin" : "Pin to top", icon: isPinned ? unPinIcon : pinIcon, onClick: () => onPin?.(notebook) },
        { id: "delete", label: "Delete", type: "danger", icon: deleteIcon, onClick: () => onDelete?.(notebook.id) },
    ];

    return (
        <div
            onClick={() => navigate(`/notebook/${notebook.id}`)}
            className={`grid grid-cols-[1fr_120px_140px_40px] items-center px-5 py-4 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${!isLast ? "border-b border-zinc-200 dark:border-zinc-800" : ""
                }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className={`w-1.5 h-6 rounded-full shrink-0 ${getSpineColor(notebook.color)}`} />
                <span className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">
                    {notebook.title}
                </span>
            </div>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">{notebook.pages} pages</span>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">{notebook.date}</span>

            {/* <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> */}
            <DropdownMenu
                align="left"
                width={220}
                items={menuItems}
                trigger={(toggleProps) => (
                    // <button {...toggleProps} className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-zinc-800">
                    //     <EllipsisVertical className="size-4" />
                    // </button>
                    <IconButton {...toggleProps} className="aspect-square!" >
                        <EllipsisVertical className="size-4" />
                    </IconButton>
                )}
            />

        </div>
    );
}



export function NotebookGridCard({ notebook, onEdit, onPin, onDelete }) {

    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const isPinned = notebook?.pinned || false;

    const menuRef = useRef(null);

    const icon = notebook.type === "pdf" ? pdfFileIcon : notebook.type === "docx" ? docsFileIcon : noteIcon;

    const menuItems = [
        { id: "edit", label: "Edit title", icon: editIcon, onClick: () => onEdit?.(notebook) },
        { id: "pin", label: isPinned ? "Unpin" : "Pin to top", icon: isPinned ? unPinIcon : pinIcon, onClick: () => onPin?.(notebook) },
        { id: "delete", label: "Delete", type: "danger", icon: deleteIcon, onClick: () => onDelete?.(notebook.id) },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            onClick={() => navigate(`/notebook/${notebook.id}`)}
            className={`rounded-xl ${getBgColor(notebook.color)} animate-fade-in-down border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-6 flex items-start gap-3 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 h-full`}
        >
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-between items-start w-full grow">
                    <div>
                        <img src={icon} className="object-cover h-14" alt="File Icon" />
                    </div>

                    {/* <div className="relative"> 
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
                            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-zinc-800"
                        >
                            <EllipsisVertical className="size-4" />
                        </button>

                        {menuOpen && ( 

                            <div ref={menuRef} className="list-none text-content-default popover-menu min-w-50 max-w-70 absolute top-full left-0 rounded-md overflow-hidden shadow-lg  z-10">

                                <List sx={{ px: 1, bgcolor: 'background.paper' }} >

                                    {menuItems.map((item) => (
                                        <ListItem disablePadding >
                                            <ListItemButton onClick={(e) => { e.stopPropagation(), item.action() }} >
                                                <ListItemIcon sx={{ color: "inherit" }} >
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText sx={{ "& .MuiListItemText-primary": { fontWeight: 500, fontSize: "15px" } }} primary={item.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}

                                </List>

                            </div>
                        )}
                    </div>  */}

                    <div className="flex items-center gap-1">
                        {
                            isPinned && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPin?.(notebook)
                                    }}
                                >
                                    <PinOff className="size-4" />
                                </IconButton>
                            )
                        }

                        <DropdownMenu
                            align="left"
                            width={220}
                            items={menuItems}
                            trigger={(toggleProps) => (
                                // <button {...toggleProps} className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-zinc-800">
                                //     <EllipsisVertical className="size-4" />
                                // </button>
                                <IconButton {...toggleProps} >
                                    <EllipsisVertical className="size-4" />
                                </IconButton>
                            )}
                        />
                    </div>

                </div>

                <div className="flex flex-col w-full mt-5 pl-2">
                    <p className="text-lg font-medium line-clamp-2 wrap-break-word text-zinc-900 dark:text-zinc-100">
                        {notebook.title}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 pt-2">
                        {notebook.pages} pages &middot; {notebook.date}
                    </p>
                </div>
            </div>
        </div>
    );
}