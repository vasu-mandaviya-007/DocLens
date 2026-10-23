import { Button } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { register, verifyEmail, resendVerificationOtp } from "../apis/authApi.js";
import { parseApiError } from "../utils/errorHandler.js";
import { OTP_LENGTH, OTP_REGEX, RESEND_COOLDOWN_SECONDS } from "../constants/auth.js";
import { useResendCooldown } from "../hooks/useResendCooldown.js";

import AuthLayout, { APP_NAME } from "../components/auth/AuthLayout.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import PasswordField, { isPasswordValid } from "../components/auth/PasswordField.jsx";
import { Loader2, ShoppingBag, StepForward } from "lucide-react";
import CustomOtpInput from "../components/auth/CustomOtpInput.jsx";
import AuthHeader from "../components/auth/AuthHeader.jsx";
import { submitButtonSx } from "../utils/submitButtonSx.jsx";
import { useAuthStore } from "../store/authStore.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from || "/";

    const emailToVerify = location.state?.verifyEmail;

    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState(emailToVerify ?? "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [step, setStep] = useState(emailToVerify ? 2 : 1);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resending, setResending] = useState(false);

    const {
        secondsLeft: resendCooldown,
        checking: checkingCooldown,
        start: startResendCooldown,
    } = useResendCooldown("verify", email, step === 2);

    const validate = () => {
        const next = {};

        if (!username.trim()) next.username = "Username is required";

        if (!email.trim()) {
            next.email = "Email is required";
        } else if (!EMAIL_REGEX.test(email)) {
            next.email = "Enter a valid email address";
        }

        if (!password) {
            next.password = "Password is required";
        } else if (!isPasswordValid(password)) {
            next.password = "Password must be at least 8 characters and include a letter and a number";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // ---------- Step 1: signup ----------
    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!validate()) return;

        setLoading(true);
        try {
            await register({ username, email, password });
            toast.success("We sent a verification code to your email");
            setStep(2);
            setOtp("");
            startResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            const { message, fields } = parseApiError(err);
            if (Object.keys(fields).length > 0) {
                setErrors((prev) => ({ ...prev, ...fields }));
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // ---------- Step 2: verify OTP ----------
    const submitOtp = async (code) => {
        if (loading) return; 

        if (!OTP_REGEX.test(code)) {
            setOtpError(`Enter the ${OTP_LENGTH}-digit code`);
            return;
        }

        setLoading(true);
        try {
            const { data: user } = await verifyEmail({ email, otp: code });
            setAuth({ user });
            toast.success(`Welcome, ${user?.username?.split(" ")[0] ?? "there"}`);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            const { message, fields } = parseApiError(err);
            setOtpError(fields?.otp || message);
            setOtp("");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (val) => {
        setOtp(val);
        if (otpError) setOtpError("");
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || checkingCooldown || resending) return;

        setResending(true);
        setOtpError("");
        try {
            await resendVerificationOtp(email);
            toast.success("A new code has been sent");
            startResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            toast.error(parseApiError(err).message);
        } finally {
            setResending(false);
        }
    };

    const goBackToFormStep = () => {
        setStep(1);
        setOtp("");
        setOtpError("");
    };

    const busy = loading || googleLoading || githubLoading;

    return (

        <AuthLayout footerPrompt="Already have an account?" footerLinkText="Sign in" footerLinkTo="/login">
            
            {step === 1 && (

                <div className="flex flex-col items-stretch gap-8">

                    <AuthHeader
                        icon={ShoppingBag}
                        title={`Create your ${APP_NAME} account`}
                        subtitle="Welcome! Please fill in the details to get started."
                    />

                    <div className="flex flex-col items-stretch justify-start gap-6">

                        <div className="w-full">

                            <OAuthButtons
                                mode="register"
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
                                id="username"
                                label="Username"
                                required
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                                }}
                                disabled={busy}
                                placeholder="Enter your full name"
                                error={errors.username}
                                autoComplete="name"
                            />

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

                            <PasswordField
                                id="password"
                                label="Password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                }}
                                disabled={busy}
                                placeholder="Create a password"
                                externalError={errors.password}
                            />

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
                                    Create account
                                </Button>
                            </div>

                        </form>

                    </div>

                </div>

            )}

            {step === 2 && (

                <div key="step2" className="flex py-2 flex-col items-center gap-8">

                    <AuthHeader
                        icon={ShoppingBag}
                        title="Verify your email"
                        subtitle="Enter the verification code sent to your email"
                        email={email}
                        onEditEmail={goBackToFormStep}
                    />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitOtp(otp);
                        }}
                        className="flex flex-col items-center w-full gap-8"
                    >

                        <div className="flex flex-col items-center justify-center gap-3">
                            
                            <CustomOtpInput
                                value={otp}
                                onChange={handleOtpChange}
                                length={OTP_LENGTH}
                                disabled={loading}
                                onFilled={submitOtp}
                                error={otpError}
                            />

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0 || checkingCooldown || resending}
                                className="login-body text-[13px] text-color-primary hover:underline disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? (
                                    <>
                                        Didn't receive a code? <span>Resend ({resendCooldown})</span>
                                    </>
                                ) : (
                                    <>
                                        Didn't receive a code? <span className="font-medium">Resend</span>
                                    </>
                                )}
                            </button>

                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            endIcon={<StepForward size={15} />}
                            loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                            variant="contained"
                            disableElevation
                            sx={submitButtonSx}
                        >
                            Continue
                        </Button>

                    </form>

                </div>

            )}

        </AuthLayout>

    );
    
};

export default Register;