// import { FileText } from "lucide-react";
// import ThemeToggle from "./ThemeToggle.jsx";

// export default function Header() {

//     return ( 

//         <div className="flex items-center justify-between mb-14">
//             <div className="flex items-center gap-2.5">
//                 <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
//                     <FileText className="w-4 h-4 text-white" strokeWidth={2} />
//                 </div>
//                 <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
//                     Quire Notebook
//                 </span>
//             </div>
//             <div className="flex items-center gap-3">
//                 <ThemeToggle />
//                 <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
//                     VM
//                 </div>
//             </div>
//         </div>

//     );

// } 



// import ThemeToggle from "./ThemeToggle.jsx";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuthStore } from "../store/authStore.js";
// import { logout } from "../apis/authApi.js";
// import default_avatar from "../assets/default-avatar.png";
// import { useEffect, useRef, useState } from "react";
// import { CirclePlus, LogOut, Plus, Settings } from 'lucide-react';


// export default function Header() { 

//     const navigate = useNavigate();

//     const user = useAuthStore(state => state.user);
//     const isAuthenticated = useAuthStore(state => state.isAuthenticated);
//     const handleLogout = useAuthStore(state => state.handleLogout);

//     const [menuOpen, setMenuOpen] = useState(false); 

//     const menuRef = useRef(null);

//     useEffect(()=> {

//         const handleOutsideClick = (event) => {
//             if(menuRef.current && !menuRef.current.contains(event.target)){
//                 setMenuOpen(false);
//             }
//         }

//         document.addEventListener("mousedown", handleOutsideClick)
//         return () => document.removeEventListener("mousedown", handleOutsideClick)

//     },[])

//     return (

//         <div className="bg-background w-full border-b dark:border-zinc-800 border-gray-200 h-16">

//             <div className="mx-auto flex h-full w-full items-center px-6"> 

//                 <div className="relative flex w-full items-center text-sm md:text-base">

//                     {/* <div className="dark:flex hidden items-center gap-2.5">
//                         <img src="/dark_logo.png" className="h-9" alt="" />
//                     </div>

//                     <div className="dark:hidden flex items-center gap-2.5">
//                         <img src="/light_logo.png" className="h-9" alt="" />
//                     </div> */}

//                     <div className="dark:flex hidden items-center gap-2.5">
//                         <img src="/dark_logo2.png" className="h-9" alt="" />
//                     </div>

//                     <div className="dark:hidden flex items-center gap-2.5">
//                         <img src="/light_logo2.png" className="h-9" alt="" />
//                     </div>

//                     <div className="@tw ml-auto hidden lg:flex lg:gap-1 text-xs">

//                         <ThemeToggle />

//                         <div className="p-0.5 ml-2">
//                             {
//                                 isAuthenticated
//                                     ?
//                                     <div ref={menuRef} className='flex items-center gap-3 relative'>

//                                         {/* <div style={{ display: menuOpen ? "flex" : "none" }} onClick={() => setMenuOpen(false)} className='fixed w-full h-full z-2 left-0 top-0'></div> */}

//                                         <button
//                                             onClick={() => setMenuOpen(!menuOpen)}
//                                             className="relative group auth-user-button cursor-pointer overflow-hidden rounded-full shrink-0 ml-1.5 transition-all duration-200"
//                                             aria-label="Go to profile"
//                                         >
//                                             <img src={user?.avatar || default_avatar} className="h-9 w-9 object-cover rounded-full" alt="Profile" />
//                                             <span className="absolute border -skew-x-30 -translate-x-10 group-hover:translate-x-10 duration-500 w-4 h-12 z-10 bg-white/40 -top-2 left-2" />
//                                         </button>

//                                         {
//                                             menuOpen && (

//                                                 <div className={`user-button-popover-card z-50 rounded-lg overflow-hidden flex items-stretch justify-start flex-col absolute top-[calc(100%+5px)] right-0 w-94 max-w-[calc(-2rem+100vw)]`}>

//                                                     <div className='popover-main flex flex-col items-stretch justify-start border-b border-b-gray-200 bg-(--clerk-color-background) '>

//                                                         <div className='flex flex-row items-center justify-start gap-4 p-4 w-full text-(--clerk-color-foreground)'>

//                                                             <div className="relative group cursor-pointer overflow-hidden rounded-full shrink-0 ml-1.5 transition-all duration-200">
//                                                                 <img src={user?.avatar || default_avatar} className="h-9 w-9 object-cover rounded-full" alt="Profile" />
//                                                             </div>

//                                                             <span className='flex flex-col items-stretch justify-center text-start min-w-0'>
//                                                                 <span className='font-medium login-body leading-[1.38462] text-[13px] '>
//                                                                     Vasu Mandaviya
//                                                                 </span>
//                                                                 <span className='text-clerk-muted-foreground font-normal leading-[1.38462] text-[13px] ' >vasu@gmail.com</span>
//                                                             </span>

//                                                         </div>

//                                                         <div className="user-button-action flex items-stretch justify-start ">

//                                                             <div className='flex items-stretch justify-between gap-2 ms-13 w-full pt-0 pb-5 px-4'>

//                                                                 <button className='user-popover-action-btn manage-account-action-btn'>
//                                                                     <Settings />
//                                                                     Manage account
//                                                                 </button>

//                                                                 <button onClick={handleLogout} className='user-popover-action-btn manage-account-action-btn'>
//                                                                     <LogOut />
//                                                                     Logout
//                                                                 </button>

//                                                             </div>

//                                                         </div>

//                                                         {/* <div className="flex flex-col items-stretch justify-start">

//                                                             <button className="border-t border-t-clerk-divider-bg px-5 py-2.5 hover:bg-user-action-btn-hover inline-flex items-center font-medium text-[13px] grow shrink basis-0 justify-start gap-4 outline-none select-none text-clerk-muted-foreground"> 

//                                                                 <div className="flex flex-row items-center grow-0 shrink-0 basis-9 justify-center min-h-9 min-w-6">

//                                                                     <CirclePlus className="shrink-0 max-w-full w-9 h-6" />

//                                                                 </div>

//                                                                 Add account

//                                                             </button> 

//                                                         </div> */} 

//                                                     </div>

//                                                     <div className='relative bg-(image:--color-user-button-footer-bg) -mt-2 pt-2'>
//                                                         <span className="login-body px-8 py-4 flex items-center justify-center gap-1 z-1 text-xs">
//                                                             <span className="font-medium text-clerk-muted-foreground">Secured by</span>
//                                                             {/* <Link to={"/"} className="font-semibold text-[#6B7280]">
//                                                                 <img src={logo} className="h-4 select-none" alt="" />
//                                                             </Link> */}
//                                                             <Link to={"/"} className="font-bold text-[#6B7280]">
//                                                                 <span className="text-blue-500">Doc</span>Lens
//                                                             </Link>
//                                                         </span>
//                                                     </div>

//                                                 </div>
//                                             )
//                                         }

//                                     </div>
//                                     :
//                                     <button onClick={() => navigate("/register")} className="bg-button-primary text-white dark:text-black font-medium px-5 py-1 h-full rounded-full text-sm">
//                                         SignUp
//                                     </button>
//                             }
//                         </div>

//                         {/* <div className="w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
//                             VM
//                         </div> */}
//                     </div>

//                 </div>


//             </div>

//         </div>

//     );

// }









// import ThemeToggle from "./ThemeToggle.jsx";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuthStore } from "../store/authStore.js";
// import default_avatar from "../assets/default-avatar.png";
// import { useEffect, useRef, useState } from "react";
// import { LogOut, Settings } from "lucide-react";

// export default function Header() {
//     const navigate = useNavigate();

//     const user = useAuthStore((state) => state.user);
//     const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//     const handleLogout = useAuthStore((state) => state.handleLogout);

//     const [menuOpen, setMenuOpen] = useState(false);
//     const menuRef = useRef(null);

//     useEffect(() => {
//         const handleOutsideClick = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) {
//                 setMenuOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleOutsideClick);
//         return () => document.removeEventListener("mousedown", handleOutsideClick);
//     }, []);

//     return (
//         <div className="bg-surface-default/80 backdrop-blur-xl w-full border-b border-lines-divider h-16 sticky top-0 z-30">
//             <div className="mx-auto flex h-full w-full items-center px-6">
//                 <div className="dark:flex hidden items-center gap-2.5">
//                     <img src="/dark_logo2.png" className="h-8" alt="DocLens" />
//                 </div>
//                 <div className="dark:hidden flex items-center gap-2.5">
//                     <img src="/light_logo2.png" className="h-8" alt="DocLens" />
//                 </div>

//                 <div className="ml-auto hidden lg:flex lg:items-center lg:gap-2">
//                     <ThemeToggle />

//                     {isAuthenticated ? (
//                         <div ref={menuRef} className="relative">
//                             <button
//                                 onClick={() => setMenuOpen((p) => !p)}
//                                 className="rounded-full overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200"
//                                 aria-label="Account menu"
//                                 aria-expanded={menuOpen}
//                             >
//                                 <img
//                                     src={user?.avatar || default_avatar}
//                                     className="h-8 w-8 object-cover rounded-full"
//                                     alt=""
//                                 />
//                             </button>

//                             {menuOpen && (
//                                 <div className="absolute top-[calc(100%+8px)] right-0 w-72 rounded-2xl bg-surface-default border border-lines-divider shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden z-50">
//                                     <div className="flex items-center gap-3 p-4 border-b border-lines-divider">
//                                         <img
//                                             src={user?.avatar || default_avatar}
//                                             className="h-9 w-9 object-cover rounded-full shrink-0"
//                                             alt=""
//                                         />
//                                         <div className="min-w-0">
//                                             <p className="text-[13px] font-medium text-content-default truncate">
//                                                 {user?.name || "Your account"}
//                                             </p>
//                                             <p className="text-[12px] text-content-deemphasized truncate">
//                                                 {user?.email || ""}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="p-1.5">
//                                         <button
//                                             onClick={() => { setMenuOpen(false); navigate("/settings"); }}
//                                             className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-content-default hover:bg-surface-emphasized transition-colors"
//                                         >
//                                             <Settings className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
//                                             Manage account
//                                         </button>
//                                         <button
//                                             onClick={() => { setMenuOpen(false); handleLogout(); }}
//                                             className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-danger hover:bg-danger/8 transition-colors"
//                                         >
//                                             <LogOut className="w-4 h-4" strokeWidth={1.75} />
//                                             Log out
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     ) : (
//                         <button
//                             onClick={() => navigate("/register")}
//                             className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-[13px] transition-colors"
//                         >
//                             Sign up
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }







import ThemeToggle from "./ThemeToggle.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import UserButton from "./UserButton.jsx";

export default function Header() {

    const navigate = useNavigate();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (

        <div className="bg-surface-default/80 backdrop-blur-xl w-full border-b border-lines-divider h-16 sticky top-0 z-30">

            <div className="mx-auto flex h-full w-full items-center px-6">

                <Link to={"/"} >
                    <div className="dark:flex hidden items-center gap-2.5">
                        <img src="/dark_logo2.png" className="h-8" alt="DocLens" />
                    </div>

                    <div className="dark:hidden flex items-center gap-2.5">
                        <img src="/light_logo2.png" className="h-8" alt="DocLens" />
                    </div>
                </Link>

                <div className="ml-auto hidden lg:flex lg:items-center lg:gap-2">
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <UserButton />
                    ) : (
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-[13px] transition-colors"
                        >
                            Sign up
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}