import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore.js';
import default_avatar from "../assets/default-avatar.png";
import { LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';


export const Profile = () => {

    const user = useAuthStore(state => state.user);
    const [dropOpen, setDropOpen] = useState(false);


    return (
        <div className='min-h-screen flex items-center justify-center'>

            <div className='flex items-center gap-3 relative'>

                {/* <div style={{ display: dropOpen ? "flex" : "none" }} onClick={() => setDropOpen(false)} className='fixed w-full h-full z-2 left-0 top-0'></div> */}

                <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="relative group auth-user-button cursor-pointer overflow-hidden rounded-full shrink-0 ml-1.5 transition-all duration-200"
                    aria-label="Go to profile"
                >
                    <img src={user?.avatar || default_avatar} className="h-9 w-9 object-cover rounded-full" alt="Profile" />
                    <span className="absolute border -skew-x-30 -translate-x-10 group-hover:translate-x-10 duration-500 w-4 h-12 z-10 bg-white/40 -top-2 left-2" />
                </button>

                {
                    dropOpen && (

                        <div className={`user-button-popover-card z-50 rounded-lg overflow-hidden flex items-stretch justify-start flex-col absolute top-[calc(100%+5px)] right-0 w-94 max-w-[calc(-2rem+100vw)]`}>

                            <div className='popover-main flex flex-col items-stretch justify-start border-b border-b-gray-200 bg-(--clerk-color-background) '>

                                <div className='flex flex-row items-center justify-start gap-4 p-4 w-full text-(--clerk-color-foreground)'>

                                    <div className="relative group cursor-pointer overflow-hidden rounded-full shrink-0 ml-1.5 transition-all duration-200">
                                        {/* <img src={user?.avatar || default_avatar} className="h-9 w-9 object-cover rounded-full" alt="Profile" /> */}
                                        <img src={"https://storage.googleapis.com/images.clerk.dev/examples/previews/cameron-walker.jpg"} className="h-9 w-9 object-cover rounded-full" alt="Profile" />
                                    </div>

                                    <span className='flex flex-col items-stretch justify-center text-start min-w-0'>
                                        <span className='font-medium login-body leading-[1.38462] text-[13px] '>
                                            Vasu Mandaviya
                                        </span>
                                        <span className='text-clerk-muted-foreground font-normal leading-[1.38462] text-[13px] ' >vasu@gmail.com</span>
                                    </span>

                                </div>

                                <div className="user-button-action flex items-stretch justify-start ">

                                    <div className='flex items-stretch justify-between gap-2 ms-13 w-full pt-0 pb-5 px-4'>

                                        <button className='user-popover-action-btn manage-account-action-btn'>
                                            <Settings />
                                            Manage account
                                        </button>

                                        <button className='user-popover-action-btn manage-account-action-btn'>
                                            <LogOut />
                                            Logout
                                        </button>

                                    </div>

                                </div>

                            </div>

                            {/* <div className='flex flex-col items-stretch justify-start text-[13px] text-neutral-600'>
                                {DROPDOWN_ITEMS.map(({ Icon, label, to }) => (
                                    <button
                                        key={to}
                                        onClick={() => { navigate(to); setDropOpen(false); }}
                                        className="flex items-center hover:bg-gray-100 w-full gap-6 px-7 py-4 border-b border-gray-200"
                                    >
                                        <Icon className="text-gray-700 text-lg" />
                                        {label}
                                    </button>
                                ))}

                                <button
                                    onClick={logout}
                                    className="flex items-center hover:bg-gray-100 w-full gap-6 px-7 py-4 border-b border-gray-200"
                                >
                                    <TbLogout className='text-gray-700 text-base' />
                                    Logout
                                </button>
                            </div> */}

                            <div className='relative bg-(image:--color-user-button-footer-bg) -mt-2 pt-2'>
                                {/* <div
                            className="absolute inset-0 pointer-events-none select-none mask-[linear-gradient(transparent_0%,black)] [background:repeating-linear-gradient(-45deg,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%),color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_12px)]"
                        /> */}
                                <span className="login-body px-8 py-4 flex items-center justify-center gap-2 z-1 text-xs">
                                    <span className="font-medium text-clerk-muted-foreground">Secured by </span>
                                    <Link to={"/"} className="font-semibold text-[#6B7280]">
                                        <img src={"https://storage.googleapis.com/images.clerk.dev/examples/previews/cameron-walker.jpg"} className="h-4 select-none" alt="" />
                                    </Link>
                                </span>
                            </div>

                        </div>
                    )
                }

            </div>

        </div>
    )
}
