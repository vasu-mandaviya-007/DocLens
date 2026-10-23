// import { useRef, useState, useCallback, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";

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
//         const menuHeight = items.length * 40 + 12;

//         let top = rect.bottom + 6;
//         let left = align === "right" ? rect.right - width : rect.left;

//         if (top + menuHeight > window.innerHeight) {
//             top = rect.top - menuHeight - 6;
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
//                         className="rounded-xl popover-menu overflow-hidden shadow-[0_12px_36px_-8px_rgba(0,0,0,0.2)] border border-lines-divider bg-surface-default"
//                     >
//                         <List sx={{ px: 1, py: 1, bgcolor: "transparent" }}>
//                             {items.map((item) => (
//                                 <div key={item.id}>
//                                     {item.divider && <Divider sx={{ my: 0.5, borderColor: "var(--color-lines-divider)" }} />}
//                                     <ListItem disablePadding>
//                                         <ListItemButton
//                                             disabled={item.disabled}
//                                             onClick={() => {
//                                                 item.onClick?.();
//                                                 if (closeOnSelect) setOpen(false);
//                                             }}
//                                             sx={{
//                                                 borderRadius: "8px",
//                                                 color: item.type === "danger" ? "var(--color-danger)" : "var(--color-content-default)",
//                                                 "&:hover": {
//                                                     bgcolor: item.type === "danger" ? "rgba(255,59,48,0.08)" : "var(--color-surface-emphasized)",
//                                                 },
//                                             }}
//                                         >
//                                             {item.icon && (
//                                                 <ListItemIcon
//                                                     sx={{ color: "inherit", minWidth: 30 }}
//                                                 >
//                                                     {item.icon}
//                                                 </ListItemIcon>
//                                             )}
//                                             <ListItemText
//                                                 sx={{
//                                                     "& .MuiListItemText-primary": {
//                                                         fontWeight: 500,
//                                                         fontSize: "13px",
//                                                         color: "inherit",
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








// HOLD PRESS TO TRIGGER

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";

export default function DropdownMenu({
    trigger,
    items = [],
    align = "left",
    width = 220,
    closeOnSelect = true,
    triggerOn = "click", // "click" | "hold"
    holdDelay = 500,     // Hold time in ms
}) {
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const holdTimerRef = useRef(null);
    const startCoordRef = useRef({ x: 0, y: 0 });

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

    // Normal Click Toggle
    const toggle = useCallback(
        (e) => {
            e.stopPropagation();
            if (!open) calculatePosition();
            setOpen((p) => !p);
        },
        [open, calculatePosition]
    );

    // Hold Press Handlers
    const handleHoldCancel = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
    }, []);

    const handleHoldStart = useCallback(
        (e) => {
            // Sirf primary click ya touch allow karein
            if (e.pointerType === "mouse" && e.button !== 0) return;

            startCoordRef.current = { x: e.clientX, y: e.clientY };
            handleHoldCancel();

            holdTimerRef.current = setTimeout(() => {
                calculatePosition();
                setOpen(true);
                // Mobile par halka haptic vibration (optional)
                if (navigator.vibrate) navigator.vibrate(40);
            }, holdDelay);
        },
        [calculatePosition, handleHoldCancel, holdDelay]
    );

    const handleHoldMove = useCallback(
        (e) => {
            if (!holdTimerRef.current) return;
            const dx = Math.abs(e.clientX - startCoordRef.current.x);
            const dy = Math.abs(e.clientY - startCoordRef.current.y);

            // Agar user scroll kar raha hai (10px se zyada move), to hold cancel kar do
            if (dx > 10 || dy > 10) {
                handleHoldCancel();
            }
        },
        [handleHoldCancel]
    );

    useEffect(() => {
        return () => handleHoldCancel();
    }, [handleHoldCancel]);

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

        // pointerdown mobile touch aur mouse dono par kaam karta hai
        document.addEventListener("pointerdown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open, calculatePosition]);

    const triggerProps =
        triggerOn === "hold"
            ? {
                ref: triggerRef,
                onPointerDown: handleHoldStart,
                onPointerMove: handleHoldMove,
                onPointerUp: handleHoldCancel,
                onPointerLeave: handleHoldCancel,
                onPointerCancel: handleHoldCancel,
                onContextMenu: (e) => e.preventDefault(),
                "aria-expanded": open,
            }
            : {
                ref: triggerRef,
                onClick: toggle,
                "aria-expanded": open,
            };

    return (
        <>
            {trigger(triggerProps)}

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
                                                <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
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