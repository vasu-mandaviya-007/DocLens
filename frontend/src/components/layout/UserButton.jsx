import React, { useEffect, useRef, useState } from 'react'
import default_avatar from "../../assets/default-avatar.png";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';


const UserButton = () => {

    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user); 
    const handleLogout = useAuthStore((state) => state.handleLogout); 

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (

        <div ref={menuRef} className="relative">

            <button
                onClick={() => setMenuOpen((p) => !p)}
                className="rounded-full overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200"
                aria-label="Account menu"
                aria-expanded={menuOpen}
            >
                <img
                    src={user?.avatar || default_avatar}
                    className="h-8 w-8 object-cover rounded-full"
                    alt=""
                />
            </button>

            {menuOpen && (

                <div className="absolute top-[calc(100%+8px)] right-0 w-72 rounded-xl bg-surface-default border border-lines-divider shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden z-50">

                    <div className="flex items-center gap-3 p-4 border-b border-lines-divider">

                        <img
                            src={user?.avatar || default_avatar}
                            className="h-9 w-9 object-cover rounded-full shrink-0"
                            alt=""
                        />

                        <div className="min-w-0">

                            <p className="text-[13px] font-medium text-content-default truncate">
                                {user?.name || "Your account"}
                            </p>

                            <p className="text-[12px] text-content-deemphasized truncate">
                                {user?.email || ""}
                            </p>

                        </div>

                    </div>

                    <div className="p-1.5">

                        <button
                            onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-content-default hover:bg-surface-emphasized transition-colors"
                        >
                            <Settings className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
                            Manage account
                        </button>

                        <button
                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-danger hover:bg-danger/8 transition-colors"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={1.75} />
                            Log out
                        </button>

                    </div>

                </div>

            )}

        </div>

    )

}

export default UserButton;