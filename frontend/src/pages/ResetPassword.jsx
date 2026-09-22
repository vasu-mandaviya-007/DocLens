import { Button } from '@mui/material'
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { resetPassword } from "../apis/authApi.js";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import { ArrowRight, Loader2, ShoppingBag, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);

    const validate = () => {
        const next = {};
        if (!password) {
            next.password = "Password is required";
        } else if (password.length < 8) {
            next.password = "Password must be at least 8 characters";
        }
        if (confirmPassword !== password) {
            next.confirmPassword = "Passwords do not match";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!validate()) return;

        setLoading(true);
        try {
            await resetPassword({ token, newPassword: password });
            setDone(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout footerPrompt="Need a new link?" footerLinkText="Request one" footerLinkTo="/forgot-password">
                <div className="login-animate flex flex-col items-center text-center gap-3">
                    <h1 className="auth-header-title">Invalid link</h1>
                    <p className="login-body text-sm text-clerk-muted-foreground max-w-xs">
                        This password reset link is missing or malformed. Please request a new one.
                    </p>
                </div>
            </AuthLayout>
        );
    }

    if (done) {
        return (
            <AuthLayout footerPrompt="" footerLinkText="" footerLinkTo="/login">
                <div className="login-animate flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-2">
                        <CheckCircle2 className="text-sm" />
                    </div>
                    <h1 className="auth-header-title">Password updated</h1>
                    <p className="login-body text-sm text-clerk-muted-foreground max-w-xs">
                        Redirecting you to sign in...
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            footerPrompt="Remembered your password?"
            footerLinkText="Sign in" 
            footerLinkTo="/login"
        >
            <div className="login-animate flex flex-col items-stretch gap-8">

                <div className='flex items-center flex-col'>
                    <div className="w-10 h-10 rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                        <ShoppingBag className="text-sm" />
                    </div>

                    <h1 className="auth-header-title">
                        Set a new password
                    </h1>

                    <p className="login-body text-sm text-center mt-1 text-clerk-muted-foreground">
                        Choose a strong password you haven't used before.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col justify-start items-stretch gap-4">

                    <AuthField
                        id="password"
                        label="New password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                        }}
                        disabled={loading}
                        placeholder="Enter a new password"
                    />
                    {errors.password && (
                        <p className="text-xs text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)] -mt-2">
                            {errors.password}
                        </p>
                    )}

                    <AuthField
                        id="confirmPassword"
                        label="Confirm new password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                        }}
                        disabled={loading}
                        placeholder="Re-enter the new password"
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)] -mt-2">
                            {errors.confirmPassword}
                        </p>
                    )}

                    <div className='mt-2'>
                        <Button
                            type="submit"
                            fullWidth
                            endIcon={<ArrowRight className="text-sm!" />}
                            disabled={loading}
                            loading={loading}
                            loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                            variant="contained"
                            disableElevation
                            sx={{
                                backgroundColor: '#2F3037',
                                '&:hover': { backgroundColor: '#131316' },
                                borderRadius: '10px',
                                paddingY: '10px',
                                fontWeight: 600,
                                textTransform: 'none', 
                                fontSize: '0.8rem',
                            }}
                        >
                            Reset password
                        </Button>
                    </div>

                </form>

            </div>
        </AuthLayout>
    )
}

export default ResetPassword;