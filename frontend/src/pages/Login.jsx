

import { Button } from '@mui/material'
import { useState } from "react"; 
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { login } from "../apis/authApi.js"; 

import AuthLayout, { APP_NAME } from "../components/auth/AuthLayout.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import { ArrowRight, Loader2, ShoppingBag, StepForward } from "lucide-react";
import { useAuthStore } from '../store/authStore.js';
import AuthHeader from '../components/auth/AuthHeader.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import { submitButtonSx } from '../utils/submitButtonSx.jsx';

const Login = () => {

    const setAuth = useAuthStore(state => state.setAuth);

    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from || "/";

    const validate = () => {
        const next = {};
        if (!email) next.email = "Email is required";
        if (!password) next.password = "Password is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await login({ email, password });
            setAuth({ user: response.data });
            const displayName = response.data?.username || "there";
            toast.success(`Welcome back, ${displayName}`);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.log(err.response);

            const error = err?.response?.data?.error;
            if (error?.fields && Object.keys(error.fields).length > 0) {
                setErrors((prev) => ({ ...prev, ...error.fields }));
            } else {
                toast.error(error?.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            footerPrompt="Don't have an account?"
            footerLinkText="Sign up"
            footerLinkTo="/register"
        >
            <div className="login-animate flex flex-col items-stretch gap-8">

                {/* <div className='flex items-center flex-col'>
                    <div className="w-10 h-10 rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                        <ShoppingBag className="text-sm" />
                    </div>

                    <h1 className="auth-header-title">
                        Sign in to {APP_NAME}
                    </h1>

                    <p className="login-body text-sm text-center mt-1 text-clerk-muted-foreground">
                        Welcome back! Please sign in to continue.
                    </p>
                </div> */}

                <AuthHeader
                    icon={ShoppingBag}
                    title={`Sign in to ${APP_NAME}`}
                    subtitle="Welcome back! Please sign in to continue."
                />

                <div className='flex flex-col items-stretch justify-start gap-6'>
                    <div className="w-full">
                        <OAuthButtons
                            mode="login"
                            loading={loading}
                            redirectPath={redirectPath}
                            githubLoading={githubLoading}
                            setGithubLoading={setGithubLoading}
                            googleLoading={googleLoading}
                            setGoogleLoading={setGoogleLoading}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full">
                        <div className="h-px flex-1 bg-clerk-divider-bg" />
                        <span className="login-body text-xs text-clerk-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-clerk-divider-bg" />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col justify-start items-stretch gap-4">

                        <AuthField
                            id="email"
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                            }}
                            disabled={loading || googleLoading || githubLoading}
                            placeholder="Enter your email address"
                            error={errors.email}
                        />
                        {/* {errors.email && (
                            <p className="text-xs text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)] -mt-2">
                                {errors.email}
                            </p>
                        )} */}

                        <div>
                            <PasswordField
                                id="password"
                                label="Password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                }}
                                disabled={loading || googleLoading || githubLoading}
                                placeholder="Enter your password"
                                externalError={errors.password}
                            />
                            {/* <AuthField
                                id="password"
                                label="Password"
                                type="password"
                                required 
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                }}
                                disabled={loading || googleLoading || githubLoading}
                                placeholder="Enter your password"
                            /> */}
                            <div className="flex justify-end mt-1.5">
                                <Link to="/forgot-password" className="text-xs font-medium text-(--clerk-color-primary) hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-[color-mix(in_srgb,transparent,var(--clerk-color-danger)_80%)] mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className='mt-4'>
                            <Button
                                type="submit"
                                fullWidth
                                endIcon={<StepForward size={15} />}
                                disabled={loading || googleLoading || githubLoading}
                                loading={loading}
                                loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                                variant="contained"
                                disableElevation
                                sx={submitButtonSx}
                            >
                                Sign in
                            </Button>
                        </div>

                    </form>

                </div>

            </div>
        </AuthLayout>
    )
}

export default Login;