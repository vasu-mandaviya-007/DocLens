import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ScanLine } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser, getErrorMessage } from "../apis/authApi.js";
import { useAuthStore } from "../store/authStore";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";

const LoginPage = () => {

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(e) { 
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    function validate() {
        const nextErrors = {};
        if (!form.email.trim()) {
            nextErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = "Enter a valid email address";
        }
        if (!form.password) {
            nextErrors.password = "Password is required";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const data = await loginUser(form);
            setAuth({ user: data.user, accessToken: data.access_token });
            toast.success(`Welcome back, ${data.user.full_name.split(" ")[0]}`);
            navigate("/dashboard");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleGoogleSuccess(data) {
        setAuth({ user: data.user, accessToken: data.access_token });
        toast.success(`Welcome, ${data.user.full_name.split(" ")[0]}`);
        navigate("/dashboard");
    }

    return (
        <div className="flex min-h-screen w-full font-[Inter,sans-serif]">
            {/* Left brand panel - hidden on small screens */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0F1B3D] p-12 lg:flex">
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
                        <div className="scan-line pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-[#22D3EE]/25 to-transparent" />
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

            {/* Right form panel */}
            <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <ScanLine className="h-6 w-6 text-[#2F6FED]" />
                        <span className="font-[Space_Grotesk,sans-serif] text-xl font-semibold text-[#0F1B3D]">
                            DocLens
                        </span>
                    </div>

                    <h2 className="font-[Space_Grotesk,sans-serif] text-2xl font-semibold text-[#0F1B3D]">
                        Welcome back
                    </h2>
                    <p className="mt-1.5 text-sm text-[#5B6472]">
                        Log in to keep asking your documents questions.
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0F1B3D]">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6472]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full rounded-lg border bg-[#E8F0FE]/40 py-2.5 pl-10 pr-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/20 ${errors.email ? "border-red-400" : "border-slate-200"
                                        }`}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-[#0F1B3D]">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs font-medium text-[#2F6FED] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6472]" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full rounded-lg border bg-[#E8F0FE]/40 py-2.5 pl-10 pr-10 text-sm text-[#0F1B3D] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/20 ${errors.password ? "border-red-400" : "border-slate-200"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6472] hover:text-[#0F1B3D]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-[#2F6FED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2557C7] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-[#5B6472]">or</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* <GoogleLoginButton onSuccess={handleGoogleSuccess} /> */} 
                    <OAuthButtons /> 

                    <p className="mt-8 text-center text-sm text-[#5B6472]"> 
                        Don't have an account?{" "}
                        <Link to="/register" className="font-medium text-[#2F6FED] hover:underline">
                            Sign up
                        </Link>
                    </p>
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
}


export default LoginPage;