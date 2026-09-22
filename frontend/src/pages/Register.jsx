

import { Button } from '@mui/material'
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { register, verifyEmail, resendVerificationOtp } from "../apis/authApi.js";

import AuthLayout, { APP_NAME } from "../components/auth/AuthLayout.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import PasswordField, { isPasswordValid } from "../components/auth/PasswordField.jsx";
import { ArrowRight, Loader2, Pencil, ShoppingBag, StepForward } from "lucide-react";
import CustomOtpInput from '../components/auth/CustomOtpInput.jsx';
import AuthHeader from '../components/auth/AuthHeader.jsx';
import { submitButtonSx } from '../utils/submitButtonSx.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

const Register = () => {

    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0) 

    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from || "/";

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

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

    const handleSubmit = async (e) => {

        e?.preventDefault?.();
        if (!validate()) return;

        setLoading(true);
        try {
            await register({ username, email, password });
            toast.success("We sent a verification code to your email");
            setStep(2);
            setOtp("");
            setResendCooldown(RESEND_SECONDS);
        } catch (err) {
            const error = err?.response?.data?.error;
            if (error?.fields && Object.keys(error.fields).length > 0) {
                setErrors((prev) => ({ ...prev, ...error.fields }));
            } else {
                toast.error(error?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleOtpVerification = async (e) => {
        e.preventDefault();
        e?.preventDefault?.();
        if (otp.length < 6) {
            toast.error("Enter the 6-digit code");
            return;
        }
        setLoading(true)

        try {
            const response = await verifyEmail({ email, otp })
            console.log(response);

            toast.success(`Welcome, ${response.data?.username.split(" ")[0]}`);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setOtpError(true);
            setOtp("");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }


    const handleOtpChange = (val) => {
        setOtp(val);
        if (otpError) setOtpError(false);
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setOtpError(false);
        try {
            await resendVerificationOtp(email);
            toast.success("A new code has been sent");
            setResendCooldown(RESEND_SECONDS);
        } catch (err) {
            const { message } = parseApiError(err);
            toast.error(message);
        }
    };

    const goBackToFormStep = () => {
        setStep(1);
        setOtp("");
        setOtpError(false);
    };

    return (
        <AuthLayout
            footerPrompt="Already have an account?"
            footerLinkText="Sign in"
            footerLinkTo="/login"
        >

            {
                step === 1 && (

                    <div className="flex flex-col items-stretch gap-8">

                        {/* <div className='flex items-center flex-col'>
                            <div className="w-10 h-10 rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                                <ShoppingBag className="text-sm" />
                            </div>

                            <h1 className="auth-header-title">
                                Create your {APP_NAME} account
                            </h1>

                            <p className="login-body text-sm text-center mt-1 text-clerk-muted-foreground">
                                Welcome! Please fill in the details to get started.
                            </p>
                        </div> */}

                        <AuthHeader
                            icon={ShoppingBag}
                            title={`Create your ${APP_NAME} account`}
                            subtitle="Welcome! Please fill in the details to get started."
                        />

                        <div className='flex flex-col items-stretch justify-start gap-6'>
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
                                    disabled={loading || googleLoading || githubLoading}
                                    placeholder="Enter your full name"
                                    error={errors.username}
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
                                    disabled={loading || googleLoading || githubLoading}
                                    placeholder="Enter your email address"
                                    error={errors.email}
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
                                    disabled={loading || googleLoading || githubLoading}
                                    placeholder="Create a password"
                                    externalError={errors.password}
                                />

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
                                        Create account
                                    </Button>
                                </div>

                            </form>

                        </div>

                    </div>

                )
            }

            {
                step === 2 && (

                    <div key="step2" className="flex py-2 flex-col items-center gap-8">

                        {/* <div className='flex flex-col items-stretch justify-start gap-1 text-center'>

                            <div className="w-10 h-10 mx-auto rounded-[10px] bg-[#131316] flex items-center justify-center text-white mb-4">
                                <ShoppingBag className="text-sm" />
                            </div>

                            <h1 className="auth-header-title">
                                Verify your email
                            </h1>

                            <p className="login-body text-sm text-clerk-muted-foreground text-center mt-1">
                                Enter the verification code sent to your email
                            </p>
                            <div className='flex items-center justify-center'>
                                <button
                                    type="button"
                                    onClick={goBackToFormStep}
                                    className="cursor-pointer login-body flex items-center gap-1.5 text-[13px] text-clerk-muted-foreground font-medium mt-0.5 hover:underline"
                                >
                                    {email || "vasumandaviya05@gmail.com"}
                                    <Pencil className="text-clerk-muted-foreground size-4" />
                                </button>
                            </div>
                        </div> */}

                        <AuthHeader
                            icon={ShoppingBag}
                            title="Verify your email"
                            subtitle="Enter the verification code sent to your email"
                            email={email || "vasumandaviya05@gmail.com"}
                            onEditEmail={goBackToFormStep}
                        />

                        <form onSubmit={handleOtpVerification} className='flex flex-col items-center w-full gap-8' >

                            <div className='flex flex-col items-center justify-center gap-3'>
                                <CustomOtpInput
                                    value={otp}
                                    onChange={handleOtpChange}
                                    length={6}
                                    disabled={loading}
                                    error={otpError}
                                />

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className="login-body text-[13px] text-color-primary hover:underline disabled:cursor-not-allowed"
                                >
                                    {resendCooldown > 0
                                        ? <>Didn't receive a code? <span className="">Resend ({resendCooldown})</span></>
                                        : <>Didn't receive a code? <span className="font-medium">Resend</span></>
                                    }
                                </button>
                            </div>

                            <Button
                                type="submit"
                                // onClick={handleOtpVerification}
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

                )
            }

        </AuthLayout>
    )
}

export default Register;

