// import { Link } from "react-router-dom";
// import { ScanLine } from "lucide-react";
// import logo from "../../assets/hero.png";
// import ThemeToggle from "../layout/ThemeToggle.jsx";

// const APP_NAME = "DocLens";

// /**
//  * Shared wrapper for all auth pages (Login, Register, ForgotPassword).
//  * Renders the left brand panel + the card container + the "secured by" footer.
//  * Page-specific content (header, form, steps) goes in as `children`.
//  */
// const AuthLayout = ({ children, footerPrompt, footerLinkText, footerLinkTo }) => {
//     return (
//         <div className="flex min-h-screen h-screen overflow-hidden w-full font-[Inter,sans-serif]">

//             {/* ── Left Brand Panel (Premium UI Redesign) ── */}
//             <div className="relative hidden w-1/2 lg:flex flex-col bg-slate-950 p-10 overflow-hidden">

//                 {/* Ambient Background Gradients */}
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
//                 <div className="absolute -left-40 -top-40 h-125 w-125 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"></div>
//                 <div className="absolute -right-20 bottom-0 h-100 w-100 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

//                 {/* Top Header: Logo & Theme Toggle */}
//                 <div className="relative z-10 flex items-center justify-between w-full">
//                     <div className="flex items-center gap-2.5">
//                         <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 backdrop-blur-sm">
//                             <ScanLine className="h-5 w-5 text-cyan-400" />
//                         </div>
//                         <span className="font-[Space_Grotesk,sans-serif] text-2xl font-bold tracking-tight text-white">
//                             DocLens
//                         </span>
//                     </div>
//                     <ThemeToggle />
//                 </div>

//                 {/* Center Content: Hero Text & Animated Card */}
//                 <div className="relative z-10 flex flex-1 flex-col justify-center max-w-lg mx-auto w-full">

//                     <div className="mb-10">
//                         <h1 className="font-[Space_Grotesk,sans-serif] text-4xl font-bold leading-tight text-white">
//                             Ask your documents <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">anything.</span>
//                         </h1>
//                         <p className="mt-4 text-base leading-relaxed text-slate-400">
//                             Upload a PDF, contract, or report — DocLens reads it and answers your
//                             questions with the exact source lines highlighted.
//                         </p>
//                     </div>

//                     {/* Premium Animated Document Card */}
//                     <div className="relative w-full max-w-md">
//                         {/* Subtle glow behind card */}
//                         <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-br from-cyan-400/20 to-blue-600/20 blur-lg opacity-50"></div>

//                         <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl">

//                             {/* Document Mockup */}
//                             <div className="scan-line-container relative overflow-hidden rounded-lg bg-slate-950/50 p-5 border border-white/5">
//                                 <div className="space-y-3 font-[JetBrains_Mono,monospace] text-[11px] leading-relaxed">
//                                     <div className="h-2 w-11/12 rounded-sm bg-slate-700/50" />
//                                     <div className="h-2 w-full rounded-sm bg-slate-700/50" />
//                                     <div className="scan-highlight h-2 w-9/12 rounded-sm bg-slate-700/50" />
//                                     <div className="h-2 w-full rounded-sm bg-slate-700/50" />
//                                     <div className="h-2 w-10/12 rounded-sm bg-slate-700/50" />
//                                     <div className="h-2 w-4/5 rounded-sm bg-slate-700/50" />
//                                 </div>
//                                 <div className="scan-line pointer-events-none absolute inset-x-0 h-12 bg-linear-to-b from-transparent via-cyan-400/20 to-transparent" />
//                             </div>

//                             {/* Result Indicator */}
//                             <div className="mt-5 flex items-center gap-3">
//                                 <div className="relative flex h-2.5 w-2.5">
//                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
//                                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
//                                 </div>
//                                 <p className="text-xs font-medium text-slate-300">
//                                     <span className="text-cyan-400">Answer found</span> — page 3, paragraph 2
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <p className="relative z-10 text-xs text-slate-500 font-medium">
//                     © {new Date().getFullYear()} DocLens. All rights reserved.
//                 </p>
//             </div>

//             {/* ── Right Form Panel ── */}
//             {/* CHANGED: `items-start` to `items-center` to perfectly center forms of any height */}
//             <div className="flex-1 w-full overflow-y-auto flex items-center justify-center bg-[#F9FAFB] dark:bg-surface-default px-4 py-6">

//                 <div className="w-full max-w-110 flex flex-col items-center mt-auto mb-auto">

//                     {/* ── Card ── */}
//                     <div className="login-animate w-full overflow-hidden border border-clerk-border-mixed rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-15px_rgba(0,0,0,0.12)]">

//                         <div className="px-7 py-8 sm:px-9 sm:py-9 auth-card bg-white dark:bg-[#131316]">
//                             {children}
//                         </div>

//                         {(footerPrompt || footerLinkText) && (
//                             <div className="relative w-full pt-2 -mt-2 flex flex-col items-stretch justify-start bg-white dark:bg-[#131316]">

//                                 <div className='py-4 px-8 flex flex-row items-stretch justify-start gap-1 my-0 mx-auto'>
//                                     <span className='text-[13px] text-pretty tracking-normal leading-snug font-normal text-clerk-muted-foreground'>
//                                         {footerPrompt}
//                                     </span>
//                                     <Link to={footerLinkTo} className='font-medium text-(--clerk-color-primary) text-[13px] hover:underline hover:contrast-200'>
//                                         {footerLinkText}
//                                     </Link>
//                                 </div>

//                                 <div className='relative'>
//                                     <div
//                                         className="absolute inset-0 pointer-events-none select-none mask-[linear-gradient(transparent_0%,black)] [background:repeating-linear-gradient(-45deg,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%),color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_7%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_6px,color-mix(in_srgb,transparent,var(--clerk-color-warning,#F36B16)_11%)_12px)]"
//                                     />
//                                     <span className="login-body px-8 py-4 border-t border-clerk-border-mixed flex items-center justify-center gap-2 z-1 text-xs">
//                                         <span className="font-medium text-clerk-muted-foreground">Secured by </span>
//                                         <Link to={"/"} className="font-semibold text-[#6B7280]">
//                                             <img src={logo} className="h-4 select-none" alt="Logo" />
//                                         </Link>
//                                     </span>
//                                 </div>
//                             </div>
//                         )}

//                     </div>
//                 </div>
//             </div>

//             <style>{`
//                 .scan-line {
//                     animation: scan-move 3.2s ease-in-out infinite;
//                 }
//                 @keyframes scan-move {
//                     0%   { top: 0%; opacity: 0; }
//                     10%  { opacity: 1; }
//                     90%  { opacity: 1; }
//                     100% { top: 92%; opacity: 0; }
//                 }
//                 .scan-highlight {
//                     animation: scan-highlight 3.2s ease-in-out infinite;
//                 }
//                 @keyframes scan-highlight {
//                     0%, 55%, 100% { background-color: rgb(51 65 85 / 0.5); }
//                     65%, 80% { background-color: rgb(34 211 238 / 0.5); box-shadow: 0 0 8px rgb(34 211 238 / 0.3); }
//                 }
//                 @media (prefers-reduced-motion: reduce) {
//                     .scan-line, .scan-highlight { animation: none; }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default AuthLayout;
// export { APP_NAME };




















import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";
import logo from "../../assets/hero.png";
import ThemeToggle from "../layout/ThemeToggle.jsx";

const APP_NAME = "DocLens";

/**
 * Shared wrapper for all auth pages (Login, Register, ForgotPassword).
 * Renders the left brand panel + the card container + the "secured by" footer.
 * Page-specific content (header, form, steps) goes in as `children`.
 */
const AuthLayout = ({ children, footerPrompt, footerLinkText, footerLinkTo }) => {
    return (
        <div className="flex min-h-screen h-screen overflow-hidden w-full font-[Inter,sans-serif]">

            {/* ── Left Brand Panel (Minimal Monochromatic UI) ── */}
            <div className="relative hidden w-1/2 lg:flex flex-col bg-[#0A0A0B] p-10 overflow-hidden border-r border-white/5">

                {/* Subtle Ambient Background Gradients (Neutral/Monochrome) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-zinc-800/10 via-[#0A0A0B] to-[#0A0A0B]"></div>
                <div className="absolute -left-40 -top-40 h-125 w-125 rounded-full bg-white/2 blur-[100px] pointer-events-none"></div>
                <div className="absolute -right-20 bottom-0 h-100 w-100 rounded-full bg-zinc-500/3 blur-[100px] pointer-events-none"></div>

                {/* Top Header: Logo & Theme Toggle */}
                <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/3 border border-white/8 backdrop-blur-sm">
                            <ScanLine className="h-5 w-5 text-zinc-300" />
                        </div>
                        <span className="font-[Space_Grotesk,sans-serif] text-2xl font-bold tracking-tight text-white">
                            DocLens
                        </span>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Center Content: Hero Text & Animated Card */}
                <div className="relative z-10 flex flex-1 flex-col justify-center max-w-lg mx-auto w-full">

                    <div className="mb-10">
                        <h1 className="font-[Space_Grotesk,sans-serif] text-4xl font-bold leading-tight text-white">
                            Ask your documents <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">anything.</span>
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-zinc-400">
                            Upload a PDF, contract, or report — DocLens reads it and answers your
                            questions with the exact source lines highlighted.
                        </p>
                    </div>

                    {/* Minimal Animated Document Card */}
                    <div className="relative w-full max-w-md">
                        {/* Subtle glow behind card */}
                        <div className="absolute -inset-0.5 rounded-2xl bg-white/5 blur-lg opacity-50"></div>

                        <div className="relative rounded-2xl border border-white/8 bg-[#111113]/80 p-6 backdrop-blur-xl shadow-2xl">

                            {/* Document Mockup */}
                            <div className="scan-line-container relative overflow-hidden rounded-lg bg-[#0A0A0B]/80 p-5 border border-white/4">
                                <div className="space-y-3 font-[JetBrains_Mono,monospace] text-[11px] leading-relaxed">
                                    <div className="h-2 w-11/12 rounded-sm bg-zinc-800/60" />
                                    <div className="h-2 w-full rounded-sm bg-zinc-800/60" />
                                    <div className="scan-highlight h-2 w-9/12 rounded-sm bg-zinc-800/60" />
                                    <div className="h-2 w-full rounded-sm bg-zinc-800/60" />
                                    <div className="h-2 w-10/12 rounded-sm bg-zinc-800/60" />
                                    <div className="h-2 w-4/5 rounded-sm bg-zinc-800/60" />
                                </div>
                                <div className="scan-line pointer-events-none absolute inset-x-0 h-12 bg-linear-to-b from-transparent via-white/[0.07] to-transparent" />
                            </div>

                            {/* Result Indicator */}
                            <div className="mt-5 flex items-center gap-3">
                                <div className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-60"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-300"></span>
                                </div>
                                <p className="text-xs font-medium text-zinc-400">
                                    <span className="text-zinc-200">Answer found</span> — page 3, paragraph 2
                                </p>
                            </div>
                        </div>
                    </div>
                    
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-zinc-500 font-medium">
                    © {new Date().getFullYear()} DocLens. All rights reserved.
                </p>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 w-full overflow-y-auto flex items-center justify-center bg-[#F9FAFB] dark:bg-surface-default px-4 py-6">

                <div className="w-full max-w-110 flex flex-col items-center mt-auto mb-auto">

                    {/* ── Card ── */}
                    <div className="login-animate w-full overflow-hidden border border-clerk-border-mixed rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-15px_rgba(0,0,0,0.12)]">

                        <div className="px-7 py-8 sm:px-9 sm:py-9 auth-card bg-white dark:bg-[#131316]">
                            {children}
                        </div>

                        {(footerPrompt || footerLinkText) && (
                            <div className="relative w-full pt-2 -mt-2 flex flex-col items-stretch justify-start bg-white dark:bg-[#131316]">

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
                                            <img src={logo} className="h-4 select-none" alt="Logo" />
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
                    0%, 55%, 100% { background-color: rgb(39 39 42 / 0.6); } /* zinc-800 */
                    65%, 80% { background-color: rgb(228 228 231 / 0.8); box-shadow: 0 0 8px rgb(255 255 255 / 0.1); } /* zinc-200 */
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