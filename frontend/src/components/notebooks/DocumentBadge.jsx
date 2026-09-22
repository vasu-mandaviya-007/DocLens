// import { FileText, Loader2, BookOpen, EllipsisVertical } from "lucide-react";
// import pdfIcon from "../../assets/pdf2.svg";
// import { useRef, useState, useCallback, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
// import { deleteIcon, editIcon } from "../common/Icons.jsx";
// import DropdownMenu from "./DropdownMenu.jsx";
// import toast from "react-hot-toast";
// import { showToast } from "../common/showToast.jsx";

// export default function DocumentBadge({ doc, onClick, onEdit, onDelete }) {
//     const isProcessing = doc?.status === "processing"; 
//     const isReady = doc?.status === "ready";

//     const menuItems = [
//         { id: "edit", label: "Rename Source", icon: editIcon, onClick: () => showToast(`${doc.filename} Renamed Successfully.`) },
//         {
//             id: "delete",
//             label: "Remove Source",
//             icon: deleteIcon,
//             type: "danger", // isse label aur icon automatically red dikhega
//             onClick: () => toast.success(`${doc.filename} deleted.`), 
//         },
//     ];

//     return (
//         <div
//             onClick={onClick}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => e.key === "Enter" && onClick?.()}
//             className="group animate-fade-in-up relative p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/60 bg-surface-emphasized hover:bg-surface-highlight  hover:shadow-md transition-all duration-200 cursor-pointer"
//         >
//             <div className="relative flex items-start gap-3">
//                 <div className="w-8.5 h-8.5 rounded-xl  flex items-center justify-center shrink-0">
//                     <img src={pdfIcon} alt="" />
//                 </div>

//                 <div className="min-w-0 flex-1">
//                     <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 truncate leading-tight">
//                         {doc.filename}
//                     </p>

//                     <div className="flex items-center gap-1.5 mt-1">
//                         {isProcessing && ( 
//                             <>
//                                 <Loader2 className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
//                                 <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Processing...</span>
//                             </>
//                         )}
//                         {isReady && doc.page_count && (
//                             <>
//                                 <BookOpen className="w-3 h-3 text-emerald-500 shrink-0" />
//                                 <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
//                                     {doc.page_count} pages · Ready
//                                 </span>
//                             </>
//                         )}
//                         {!isProcessing && !isReady && (
//                             <span className="text-xs text-danger tracking-wider font-medium capitalize">
//                                 {doc.status}
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 <div className="my-auto relative">
//                     {/* <button
//                         ref={menuBtnRef}
//                         onClick={toggleMenu}
//                         className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-zinc-800"
//                     >
//                         <EllipsisVertical className="size-4" />
//                     </button>

//                     {menuOpen &&
//                         createPortal(
//                             <div
//                                 ref={menuRef}
//                                 onClick={(e) => e.stopPropagation()}
//                                 style={{
//                                     position: "fixed",
//                                     top: menuPos.top,
//                                     left: menuPos.left,
//                                     zIndex: 1300, // MUI ke default z-index ke barabar/upar
//                                 }}
//                                 className="list-none text-content-default popover-menu min-w-50 max-w-70 rounded-md overflow-hidden shadow-lg"
//                             >
//                                 <List sx={{ px: 1, bgcolor: "background.paper" }}>
//                                     {menuItems.map((item) => (
//                                         <ListItem key={item.id} disablePadding>
//                                             <ListItemButton
//                                                 onClick={() => {
//                                                     item.action();
//                                                     setMenuOpen(false);
//                                                 }}
//                                             >
//                                                 <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
//                                                 <ListItemText
//                                                     sx={{ "& .MuiListItemText-primary": { fontWeight: 500, fontSize: "15px" } }}
//                                                     primary={item.label}
//                                                 />
//                                             </ListItemButton>
//                                         </ListItem>
//                                     ))}
//                                 </List>
//                             </div>,
//                             document.body // <-- yahi fix hai: sidebar ke overflow-hidden se bahar nikal jaata hai
//                         )} */}


//                     <DropdownMenu
//                         align="left"
//                         width={220}  
//                         items={menuItems}
//                         trigger={(toggleProps) => (
//                             // <button {...toggleProps} className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-zinc-800">
//                             //     <EllipsisVertical className="size-4" />
//                             // </button>
//                             <IconButton {...toggleProps} >
//                                 <EllipsisVertical className="size-4" /> 
//                             </IconButton>
//                         )}
//                     />

//                 </div>
//             </div>
//         </div>
//     );
// }















import { Loader2 } from "lucide-react";
import pdfIcon from "../../assets/pdf2.svg";

export default function DocumentBadge({ doc, onClick }) {
    const isProcessing = doc?.status === "processing";
    const isReady = doc?.status === "ready";

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
        }
    };

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="group relative p-3 rounded-xl bg-surface-emphasized hover:bg-primary/8 transition-colors duration-200 cursor-pointer"
        >
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <img src={pdfIcon} alt="" className="w-full h-full object-contain" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-content-default truncate leading-tight">
                        {doc.filename} 
                    </p>

                    <div className="flex items-center gap-1.5 mt-1">
                        {isProcessing && (
                            <>
                                <Loader2 className="w-3 h-3 text-warning animate-spin shrink-0" />
                                <span className="text-xs text-warning font-medium">Processing...</span>
                            </>
                        )}
                        {isReady && doc.page_count && (
                            <span className="text-xs text-success font-medium">
                                {doc.page_count} pages · Ready
                            </span>
                        )}
                        {!isProcessing && !isReady && (
                            <span className="text-xs text-danger font-medium capitalize">
                                {doc.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



