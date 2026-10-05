import ThemeToggle from "./ThemeToggle.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import default_avatar from "../../assets/default-avatar.png";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";

const Header = () => {

    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const handleLogout = useAuthStore((state) => state.handleLogout);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handleOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("pointerdown", handleOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    const displayName = user?.username || user?.name || "Your account";
    const displayEmail = user?.email || "";

    const goToProfile = () => {
        setMenuOpen(false);
        navigate("/profile");
    };

    const onLogout = () => {
        setMenuOpen(false);
        handleLogout();
    };

    return (

        <header
            className="sticky top-0 z-40 w-full border-b border-lines-divider bg-surface-default/85 backdrop-blur-md"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >

            <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">

                <Link to="/" className="flex shrink-0 items-center" aria-label="DocLens home">
                    <img
                        src="/dark_logo2.png"
                        className="hidden h-8 w-auto sm:h-9 dark:block"
                        alt="DocLens"
                    />
                    <img
                        src="/light_logo2.png"
                        className="block h-8 w-auto sm:h-9 dark:hidden"
                        alt="DocLens"
                    />
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-3">

                    <ThemeToggle />

                    {isAuthenticated ? (
                        <div ref={menuRef} className="relative flex items-center">

                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="relative group auth-user-button cursor-pointer overflow-hidden rounded-full shrink-0 ml-1.5 transition-all duration-200"
                                aria-label="Open account menu"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <img src={user?.avatar || default_avatar} className="h-9 w-9 object-cover rounded-full" alt="Profile" />
                                <span className="absolute border -skew-x-30 -translate-x-10 group-hover:translate-x-10 duration-500 w-4 h-12 z-10 bg-white/40 -top-2 left-2" />
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="user-button-popover-card absolute right-0 top-[calc(100%+8px)] z-50 flex w-88 max-w-[calc(100vw-2rem)] flex-col items-stretch justify-start overflow-hidden rounded-xl shadow-xl"
                                >

                                    <div className="popover-main flex flex-col items-stretch justify-start border-b border-b-gray-200 bg-(--clerk-color-background)">

                                        <div className="flex w-full flex-row items-center justify-start gap-3 p-4 text-(--clerk-color-foreground) sm:gap-4">

                                            <img
                                                src={user?.avatar || default_avatar}
                                                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
                                                alt="Profile"
                                            />

                                            <span className="flex min-w-0 flex-col items-stretch justify-center text-start">
                                                <span className="login-body truncate text-sm font-semibold leading-[1.38462]">
                                                    {displayName}
                                                </span>
                                                {displayEmail && (
                                                    <span className="text-clerk-muted-foreground login-body truncate text-[13px] font-normal leading-[1.38462]">
                                                        {displayEmail}
                                                    </span>
                                                )}
                                            </span>

                                        </div>

                                        <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:ms-13 sm:pl-0">
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={goToProfile}
                                                className="user-popover-action-btn manage-account-action-btn py-1.5! justify-center"
                                            >
                                                <Settings />
                                                Manage account
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={onLogout}
                                                className="user-popover-action-btn manage-account-action-btn py-1.5! justify-center"
                                            >
                                                <LogOut />
                                                Logout
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative -mt-2 bg-(image:--color-user-button-footer-bg) pt-2">
                                        <span className="login-body z-1 flex items-center justify-center gap-1 px-8 py-3 text-xs">
                                            <span className="text-clerk-muted-foreground font-medium">
                                                Secured by
                                            </span>
                                            <Link
                                                to="/"
                                                onClick={() => setMenuOpen(false)}
                                                className="font-bold text-[#6B7280]"
                                            >
                                                <span className="text-primary">Doc</span>Lens
                                            </Link>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Sign up
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}


export default Header;