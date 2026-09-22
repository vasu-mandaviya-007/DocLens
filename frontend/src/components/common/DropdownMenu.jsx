// import { useRef, useState, useCallback, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";

// /**
//  * DropdownMenu — reusable, portal-based action menu
//  * ---------------------------------------------------
//  * Kahi bhi use karo, chahe parent me `overflow: hidden` ho (sidebar, card, etc.)
//  * kyunki menu document.body me portal ho ke render hota hai.
//  *
//  * Props:
//  * - trigger: (toggleProps) => ReactNode
//  *      toggleProps = { ref, onClick, "aria-expanded" }
//  *      Apna button/icon isi function se render karo aur toggleProps spread kar do.
//  *
//  * - items: Array<{
//  *      id: string,
//  *      label: string,
//  *      icon?: ReactNode,
//  *      type?: "default" | "danger",   // danger = red text/icon
//  *      disabled?: boolean,
//  *      divider?: boolean,             // isse pehle ek divider line aa jaayegi
//  *      onClick?: () => void,
//  *   }>
//  *
//  * - align: "left" | "right"  (default "left") — trigger ke kis taraf se menu khulega
//  * - width: number (default 220) — menu ki min width
//  * - closeOnSelect: boolean (default true)
//  */
// export default function DropdownMenu({
//     trigger,
//     items = [],
//     align = "left",
//     width = 220,
//     closeOnSelect = true,
// }) {
//     const triggerRef = useRef(null);
//     const menuRef = useRef(null);
//     const [open, setOpen] = useState(false);
//     const [pos, setPos] = useState({ top: 0, left: 0 });

//     const calculatePosition = useCallback(() => {
//         if (!triggerRef.current) return;
//         const rect = triggerRef.current.getBoundingClientRect();
//         const menuHeight = items.length * 44 + 16;

//         let top = rect.bottom + 4;
//         let left = align === "right" ? rect.right - width : rect.left;

//         if (top + menuHeight > window.innerHeight) {
//             top = rect.top - menuHeight - 4; // neeche jagah nahi -> upar khol do
//         }
//         if (left + width > window.innerWidth) {
//             left = window.innerWidth - width - 8;
//         }
//         if (left < 8) left = 8;

//         setPos({ top, left });
//     }, [items.length, align, width]);

//     const toggle = useCallback(
//         (e) => {
//             e.stopPropagation();
//             if (!open) calculatePosition();
//             setOpen((p) => !p);
//         },
//         [open, calculatePosition]
//     );

//     useEffect(() => {
//         if (!open) return;

//         function handleClickOutside(e) {
//             if (
//                 triggerRef.current &&
//                 !triggerRef.current.contains(e.target) &&
//                 menuRef.current &&
//                 !menuRef.current.contains(e.target)
//             ) {
//                 setOpen(false);
//             }
//         }
//         function handleReposition() {
//             calculatePosition();
//         }
//         function handleEscape(e) {
//             if (e.key === "Escape") setOpen(false);
//         }

//         document.addEventListener("mousedown", handleClickOutside);
//         document.addEventListener("keydown", handleEscape);
//         // capture: true zaroori hai taaki kisi bhi nested scrollable container (sidebar list, etc.) ka scroll bhi pakda jaaye
//         window.addEventListener("scroll", handleReposition, true);
//         window.addEventListener("resize", handleReposition);

//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//             document.removeEventListener("keydown", handleEscape);
//             window.removeEventListener("scroll", handleReposition, true);
//             window.removeEventListener("resize", handleReposition);
//         };
//     }, [open, calculatePosition]);

//     return (
//         <>
//             {trigger({ ref: triggerRef, onClick: toggle, "aria-expanded": open })}

//             {open &&
//                 createPortal(
//                     <div
//                         ref={menuRef}
//                         onClick={(e) => e.stopPropagation()}
//                         style={{ position: "fixed", top: pos.top, left: pos.left, width, zIndex: 1300 }}
//                         className="rounded-md popover-menu overflow-hidden shadow-lg border border-zinc-100 dark:border-zinc-700/60"
//                     >
//                         <List sx={{ px: 1, bgcolor: "background.paper" }}> 
//                             {items.map((item) => (
//                                 <div key={item.id}>
//                                     {item.divider && <Divider sx={{ my: 0.5 }} />}
//                                     <ListItem disablePadding>
//                                         <ListItemButton
//                                             disabled={item.disabled}
//                                             onClick={() => {
//                                                 item.onClick?.();
//                                                 if (closeOnSelect) setOpen(false);
//                                             }}
//                                             sx={{
//                                                 borderRadius: 1,
//                                                 color: item.type === "danger" ? "error.main" : "inherit",
//                                                 "&:hover": {
//                                                     bgcolor: item.type === "danger" ? "rgba(211, 47, 47, 0.08)" : undefined,
//                                                 },
//                                             }}
//                                         >
//                                             {item.icon && (
//                                                 <ListItemIcon
//                                                     sx={{ color: item.type === "danger" ? "error.main" : "inherit", minWidth: 32 }}
//                                                 >
//                                                     {item.icon}
//                                                 </ListItemIcon>
//                                             )}
//                                             <ListItemText
//                                                 sx={{
//                                                     "& .MuiListItemText-primary": {
//                                                         fontWeight: 500,
//                                                         fontSize: "14px",
//                                                         color: item.type === "danger" ? "error.main" : "inherit",
//                                                     },
//                                                 }}
//                                                 primary={item.label}
//                                             />
//                                         </ListItemButton>
//                                     </ListItem>
//                                 </div>
//                             ))}
//                         </List>
//                     </div>,
//                     document.body
//                 )}
//         </>
//     );
// }


















import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";

/**
 * DropdownMenu — reusable, portal-based action menu
 * ---------------------------------------------------
 * Kahi bhi use karo, chahe parent me `overflow: hidden` ho (sidebar, card, etc.)
 * kyunki menu document.body me portal ho ke render hota hai.
 *
 * Props:
 * - trigger: (toggleProps) => ReactNode
 * - items: Array<{ id, label, icon?, type?: "default"|"danger", disabled?, divider?, onClick? }>
 * - align: "left" | "right"  (default "left")
 * - width: number (default 220)
 * - closeOnSelect: boolean (default true)
 */
export default function DropdownMenu({
    trigger,
    items = [],
    align = "left",
    width = 220,
    closeOnSelect = true,
}) {
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = items.length * 40 + 12;

        let top = rect.bottom + 6;
        let left = align === "right" ? rect.right - width : rect.left;

        if (top + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight - 6;
        }
        if (left + width > window.innerWidth) {
            left = window.innerWidth - width - 8;
        }
        if (left < 8) left = 8;

        setPos({ top, left });
    }, [items.length, align, width]);

    const toggle = useCallback(
        (e) => {
            e.stopPropagation();
            if (!open) calculatePosition();
            setOpen((p) => !p);
        },
        [open, calculatePosition]
    );

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(e) {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        function handleReposition() {
            calculatePosition();
        }
        function handleEscape(e) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open, calculatePosition]);

    return (
        <>
            {trigger({ ref: triggerRef, onClick: toggle, "aria-expanded": open })}

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        style={{ position: "fixed", top: pos.top, left: pos.left, width, zIndex: 1300 }}
                        className="rounded-xl popover-menu overflow-hidden shadow-[0_12px_36px_-8px_rgba(0,0,0,0.2)] border border-lines-divider bg-surface-default"
                    >
                        <List sx={{ px: 1, py: 1, bgcolor: "transparent" }}>
                            {items.map((item) => (
                                <div key={item.id}>
                                    {item.divider && <Divider sx={{ my: 0.5, borderColor: "var(--color-lines-divider)" }} />}
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            disabled={item.disabled}
                                            onClick={() => {
                                                item.onClick?.();
                                                if (closeOnSelect) setOpen(false);
                                            }}
                                            sx={{
                                                borderRadius: "8px",
                                                color: item.type === "danger" ? "var(--color-danger)" : "var(--color-content-default)",
                                                "&:hover": {
                                                    bgcolor: item.type === "danger" ? "rgba(255,59,48,0.08)" : "var(--color-surface-emphasized)",
                                                },
                                            }}
                                        >
                                            {item.icon && (
                                                <ListItemIcon
                                                    sx={{ color: "inherit", minWidth: 30 }}
                                                >
                                                    {item.icon}
                                                </ListItemIcon>
                                            )}
                                            <ListItemText
                                                sx={{
                                                    "& .MuiListItemText-primary": {
                                                        fontWeight: 500,
                                                        fontSize: "13px",
                                                        color: "inherit",
                                                    },
                                                }}
                                                primary={item.label}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                    </div>,
                    document.body
                )}
        </>
    );
}