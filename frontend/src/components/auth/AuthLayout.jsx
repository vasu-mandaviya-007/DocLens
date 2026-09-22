import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";
import logo from "../../assets/hero.png";
import ThemeToggle from "../layout/ThemeToggle.jsx";


const APP_NAME = "DocLens";

/**
 * Shared wrapper for all auth pages (Login, Register, ForgotPassword).
 * Renders the left brand panel + the card container + the "secured by" footer.
 * Page-specific content (header, form, steps) goes in as `children`.
 *
 * Usage:
 *   <AuthLayout footerPrompt="Don't have an account?" footerLinkText="Sign up" footerLinkTo="/register">
 *     ...page-specific header + form...
 *   </AuthLayout>
 */
const AuthLayout = ({ children, footerPrompt, footerLinkText, footerLinkTo }) => {

    return (
        
        <div className="flex min-h-screen h-screen overflow-hidden w-full font-[Inter,sans-serif]">

            {/* Left brand panel - hidden on small screens */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0F1B3D] p-12 lg:flex">

                <ThemeToggle />

                <div className="relative z-10 flex items-center gap-2">
                    <ScanLine className="h-6 w-6 text-[#22D3EE]" />
                    <span className="font-[Space_Grotesk,sans-serif] text-xl font-semibold text-white">
                        DocLens
                    </span>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="font-[Space_Grotesk,sans-serif] text-3xl font-semibold leading-tight text-white">
                        Ask your documents anything.
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        Upload a PDF, contract, or report — DocLens reads it and answers your
                        questions with the exact source lines highlighted.
                    </p>
                </div>

                {/* Mock document card with animated scan line */}
                <div className="relative z-10 mt-8 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <div className="scan-line-container relative overflow-hidden rounded-md">
                        <div className="space-y-2.5 font-[JetBrains_Mono,monospace] text-[11px] leading-relaxed text-slate-400">
                            <div className="h-2 w-11/12 rounded-sm bg-slate-600/40" />
                            <div className="h-2 w-full rounded-sm bg-slate-600/40" />
                            <div className="scan-highlight h-2 w-9/12 rounded-sm bg-slate-600/40" />
                            <div className="h-2 w-full rounded-sm bg-slate-600/40" />
                            <div className="h-2 w-10/12 rounded-sm bg-slate-600/40" />
                            <div className="h-2 w-4/5 rounded-sm bg-slate-600/40" />
                        </div>
                        <div className="scan-line pointer-events-none absolute inset-x-0 h-8 bg-linear-to-b from-transparent via-[#22D3EE]/25 to-transparent" />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                        <span className="text-[#22D3EE]">Answer found</span> — page 3, paragraph 2
                    </p>
                </div>

                <p className="relative z-10 text-xs text-slate-500">
                    © {new Date().getFullYear()} DocLens. All rights reserved.
                </p>

                {/* Ambient background glow */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2F6FED]/20 blur-3xl" />
            </div>

            <div className="flex-1 w-full overflow-auto flex items-start justify-center bg-[#F9FAFB] dark:bg-surface-default px-4 py-6">

                <div className="w-full max-w-110 flex flex-col items-center"> 

                    {/* ── Card ── */}
                    <div className="login-animate w-full overflow-hidden border border-clerk-border-mixed rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-15px_rgba(0,0,0,0.12)] ">

                        <div className="px-7 py-8 sm:px-9 sm:py-9 auth-card">
                            {children}
                        </div>

                        {(footerPrompt || footerLinkText) && (
                            <div className="relative w-full pt-2 -mt-2 flex flex-col items-stretch justify-start">

                                <div className='py-4 px-8 flex flex-row items-stretch justify-start gap-1 my-0 mx-auto'>
                                    <span className='text-[13px] text-pretty tracking-normal leading-snug font-normal text-clerk-muted-foreground'>
                                        {footerPrompt}
                                    </span>
                                    <Link to={footerLinkTo} className='font-medium text-(--clerk-color-primary) text-[13px] hover:underline hover:contrast-200'>
                                        {footerLinkText}
                                    </Link>
                                </div>

                                <div className='relative'>
                                    <div
                                        className="absolute inset-0 pointer-events-none select-none mask-[linear-gradient(transparent_0%,black)] [background:repeating-linear-gradient(-45deg,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%),color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_12px)]"
                                    />
                                    <span className="login-body px-8 py-4 border-t border-clerk-border-mixed flex items-center justify-center gap-2 z-1 text-xs">
                                        <span className="font-medium text-clerk-muted-foreground">Secured by </span>
                                        <Link to={"/"} className="font-semibold text-[#6B7280]">
                                            <img src={logo} className="h-4 select-none" alt="" />
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            <style>{`
                .scan-line {
                animation: scan-move 3.2s ease-in-out infinite;
                }
                @keyframes scan-move {
                0%   { top: 0%; opacity: 0; }
                10%  { opacity: 1; }
                90%  { opacity: 1; }
                100% { top: 92%; opacity: 0; }
                }
                .scan-highlight {
                animation: scan-highlight 3.2s ease-in-out infinite;
                }
                @keyframes scan-highlight {
                0%, 55%, 100% { background-color: rgb(71 85 105 / 0.4); }
                65%, 80% { background-color: rgb(34 211 238 / 0.6); }
                }
                @media (prefers-reduced-motion: reduce) {
                .scan-line, .scan-highlight { animation: none; }
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;
export { APP_NAME }; 