import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { login } from "../apis/authApi.js";
import { parseApiError } from "../utils/errorHandler.js";
import { OAUTH_ERROR_MESSAGES } from "../constants/auth.js";

import AuthLayout, { APP_NAME } from "../components/auth/AuthLayout.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import { Loader2, ShoppingBag, StepForward } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import AuthHeader from "../components/auth/AuthHeader.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import { submitButtonSx } from "../utils/submitButtonSx.jsx";

const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

const Login = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const redirectPath = location.state?.from || "/";

    // OAuth fail hone par backend /login?error=<code> pe bhejta hai: toast dikhao, URL saaf karo
    useEffect(() => {
        const code = searchParams.get("error");
        if (!code) return;
        // id: dev me StrictMode effect do baar chalata hai, to toast duplicate na ho
        toast.error(OAUTH_ERROR_MESSAGES[code] ?? "Sign-in failed. Please try again.", { id: "oauth-error" });
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

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
            toast.success(`Welcome back, ${response.data?.username || "there"}`);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            const { message, fields, code } = parseApiError(err);

            if (code === EMAIL_NOT_VERIFIED) {
                toast.success("Please verify your email. Check your inbox for the verification code.");
                navigate("/register", { state: { verifyEmail: email, from: redirectPath } });
                return;
            }

            if (Object.keys(fields).length > 0) {
                setErrors((prev) => ({ ...prev, ...fields }));
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const busy = loading || googleLoading || githubLoading;

    return (

        <AuthLayout footerPrompt="Don't have an account?" footerLinkText="Sign up" footerLinkTo="/register">
            
            <div className="login-animate flex flex-col items-stretch gap-8">

                <AuthHeader
                    icon={ShoppingBag}
                    title={`Sign in to ${APP_NAME}`}
                    subtitle="Welcome back! Please sign in to continue."
                />

                <div className="flex flex-col items-stretch justify-start gap-6">

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
                            disabled={busy}
                            placeholder="Enter your email address"
                            error={errors.email}
                            autoComplete="email"
                        />

                        <div>

                            <PasswordField
                                id="password"
                                label="Password"
                                required
                                validation={false}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                }}
                                disabled={busy}
                                placeholder="Enter your password"
                                externalError={errors.password}
                                autoComplete="current-password"
                            />

                            <div className="flex justify-end mt-1.5">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-(--clerk-color-primary) hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                        </div>

                        <div className="mt-4">

                            <Button
                                type="submit"
                                fullWidth
                                endIcon={<StepForward size={15} />}
                                disabled={busy}
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

    );
    
};

export default Login;