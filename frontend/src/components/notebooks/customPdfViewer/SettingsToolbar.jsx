// import { useZoom } from '@embedpdf/plugin-zoom/react';
// import { ZoomIn, ZoomOut } from 'lucide-react';

// export default function ZoomToolbar({ documentId }) {
//     const { provides: zoom, state: zoomState } = useZoom(documentId);

//     if (!zoom) return null;

//     return (
//         <div className="flex items-center gap-2 px-3 py-2 border-b border-lines-divider shrink-0">
//             <button onClick={() => zoom.zoomOut()} className="p-1.5 rounded hover:bg-surface-emphasized">
//                 <ZoomOut className="w-4 h-4" />
//             </button>
//             <span className="text-xs font-medium text-content-deemphasized tabular-nums w-12 text-center">
//                 {Math.round(zoomState.currentZoomLevel * 100)}%
//             </span>
//             <button onClick={() => zoom.zoomIn()} className="p-1.5 rounded hover:bg-surface-emphasized">
//                 <ZoomIn className="w-4 h-4" />
//             </button>
//         </div>
//     );
// }






import { SpreadMode, useSpread } from '@embedpdf/plugin-spread/react';
import { useZoom, ZoomMode } from '@embedpdf/plugin-zoom/react';
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Menu, FileText, BookOpen, Book, MoveHorizontal, MoveVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { deleteIcon, editIcon } from '../../common/Icons.jsx';



export default function SettingsToolbar({ documentId }) {

    const { provides: spread, spreadMode } = useSpread(documentId)

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const items = [
        { id: "group-1", type: "sub-header", label: "Spread Mode" },
        { id: "single", label: "Single", value: SpreadMode.None, icon: FileText },
        { id: "odd_spread", label: "Odd Spread", value: SpreadMode.Odd, icon: BookOpen },
        { id: "even_spread", label: "Even Spread", value: SpreadMode.Even, icon: Book },
        // { id: "divider-1", type: "divider" },
        // { id: "group-2", type: "sub-header", label: "Scroll Layout" },
        // { id: "verticle", label: "Verticle", value: SpreadMode.None, icon: MoveHorizontal },
        // { id: "horizontal", label: "Horizontal", value: SpreadMode.Odd, icon: MoveVertical },

    ];

    if (!spread) return null;
    const closeOnSelect = true;

    return (
        <div className="flex items-center gap-1 p-2 border-b border-lines-divider shrink-0">

            <div className="relative" ref={menuRef}>

                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`p-1.5 rounded text-content-default hover:bg-surface-emphasized `}
                >
                    <Menu className='size-4' />
                </button>

                {menuOpen && (

                    <div className="absolute top-full left-0 min-w-60 mt-1 z-30 bg-surface-default shadow-lg rounded-sm border border-lines-divider ">

                        <List
                            sx={{ px: 0.5, py: 0, pb: 1, bgcolor: "background.paper" }}
                        >

                            {items.map((item) => {

                                const isActive = spreadMode === item.value;

                                return (

                                    <div key={item.id}>

                                        {
                                            item.type === "sub-header"
                                                ? <ListSubheader>{item.label}</ListSubheader>
                                                : item.type === "divider"
                                                    ? <Divider sx={{ my: 0.5, borderColor: "var(--color-lines-divider)" }} />
                                                    : (

                                                        <ListItem disablePadding>
                                                            <ListItemButton
                                                                disabled={item.disabled}
                                                                onClick={() => {
                                                                    spread.setSpreadMode(item.value)
                                                                    if (closeOnSelect) setMenuOpen(false);
                                                                }}
                                                                sx={{
                                                                    backgroundColor: isActive ? "var(--color-blue-500) !important" : "unset",
                                                                    color: isActive ? "#fff !important" : "unset",
                                                                    py: 0.7
                                                                }}
                                                            >
                                                                {item.icon && (
                                                                    <ListItemIcon sx={{
                                                                        color: isActive ? "#fff !important" : "unset",
                                                                    }} >
                                                                        <item.icon className='size-4' />
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

                                                    )
                                        }

                                    </div>

                                )

                            })}

                        </List>

                        {/* <div className='px-2 text-xs py-2'>Spread Mode</div>

                        {modes.map((mode) => {
                            const Icon = mode.icon
                            const isActive = spreadMode === mode.value
                            return (
                                <button
                                    key={mode.value}
                                    onClick={() => spread.setSpreadMode(mode.value)}
                                    className={`w-full flex items-center justify-start gap-2 rounded-xs text-left px-3 py-1.5 text-xs ${isActive ? "bg-blue-500 text-white" : "bg-transparent hover:bg-surface-emphasized "}  text-content-default`}
                                >
                                    <Icon size={14} />
                                    <p className="leading-relaxed">{mode.label}</p>
                                </button>
                            )
                        })} */}

                    </div>
                )}
            </div>

        </div>
    );
}