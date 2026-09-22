

import { Button } from '@mui/material'
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { forgotPassword, verifyResetOtp, resetPassword } from "../apis/authApi.js";
import { parseApiError } from "../utils/errorHandler.js";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import PasswordField, { isPasswordValid } from "../components/auth/PasswordField.jsx";
import { ArrowRight, Loader2, MailCheck, Pencil, ShoppingBag, KeyRound, StepForward } from "lucide-react";
import CustomOtpInput from '../components/auth/CustomOtpInput.jsx';
import AuthHeader from '../components/auth/AuthHeader.jsx';
import { submitButtonSx } from '../utils/submitButtonSx.jsx';


const RESEND_COOLDOWN = 60;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState("email"); 

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // ---------- Step 1: Email ----------
    const handleEmailSubmit = async (e) => {
        e?.preventDefault?.();
        if (!email) {
            setEmailError("Email is required");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setStep("otp");
            setResendCooldown(RESEND_COOLDOWN);
            toast.success("If an account exists, a code has been sent.");
        } catch (err) {
            const { message, fields } = parseApiError(err);
            // Backend `email` field pe koi validation error de sakta hai
            // (jaise invalid email format — Pydantic EmailStr validator se)
            if (fields.email) {
                setEmailError(fields.email);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // ---------- Step 2: OTP ----------
    const handleOtpChange = (val) => {
        setOtp(val);
        if (otpError) setOtpError("");
    };

    const handleOtpSubmit = async (e) => {
        e?.preventDefault?.();

        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            setOtpError("Enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            await verifyResetOtp(email, otp);
            setStep("reset");
        } catch (err) {
            const { message, fields } = parseApiError(err);
            // Backend hamesha fields.otp bhejta hai (verify-reset-otp route dekho) — 
            // fallback sirf tab chalega jab error kisi aur wajah se aaya ho
            // (jaise network error, jahan fields khali hoga)
            setOtpError(fields.otp || message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            await forgotPassword(email);
            setResendCooldown(RESEND_COOLDOWN);
            toast.success("Code resent to your email.");
        } catch (err) {
            const { message } = parseApiError(err);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // ---------- Step 3: New Password ----------
    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        if (passwordError) setPasswordError("");
        if (confirmError) setConfirmError("");
    };

    const handleConfirmChange = (e) => {
        setConfirmPassword(e.target.value);
        if (confirmError) setConfirmError("");
    };

    const handleResetSubmit = async (e) => {
        e?.preventDefault?.();

        if (!isPasswordValid(newPassword)) {
            setPasswordError("Password does not meet the requirements");
            return;
        }
        if (newPassword !== confirmPassword) {
            setConfirmError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, newPassword);
            toast.success("Password reset successful. Please sign in.");
            navigate("/login");
        } catch (err) {
            const { message, fields } = parseApiError(err);

            if (fields.otp) {
                // /reset-password route "otp" field pe error deta hai jab
                // verified token na mile (session_error) — matlab verification
                // expire ho gaya ya kabhi hua hi nahi. User ko OTP step pe wapas bhejo.
                toast.error(fields.otp);
                setStep("otp");
                setOtp("");
            } else if (fields.new_password) {
                // Backend-side password validation fail hui (schema validator) —
                // frontend check pass ho gaya tha but backend rule strict nikla
                setPasswordError(fields.new_password);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOnFilled = () => {
        handleOtpSubmit();
    }

    // ---------- Step 3 UI ----------
    if (step === "reset") {

        return (

            <AuthLayout footerPrompt="Remembered your password?" footerLinkText="Sign in" footerLinkTo="/login">

                <AuthHeader
                    icon={KeyRound}
                    title="Set new password"
                    subtitle="Choose a strong password for your account."
                />

                <form onSubmit={handleResetSubmit} className="w-full flex flex-col gap-4">

                    <PasswordField
                        id="new-password"
                        label="New password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        externalError={passwordError}
                        required
                    />

                    <PasswordField
                        id="confirm-password"
                        label="Confirm password"
                        value={confirmPassword}
                        onChange={handleConfirmChange}
                        disabled={loading} 
                        externalError={confirmError}
                        required
                    />

                    <Button 
                        type="submit"
                        fullWidth
                        endIcon={<StepForward size={15} />}
                        loading={loading}
                        loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                        variant="contained"
                        disableElevation
                        sx={submitButtonSx}
                    >
                        Reset password
                    </Button>

                </form>

            </AuthLayout>

        );
    }

    // ---------- Step 2 UI ----------
    if (step === "otp") {

        return (

            <AuthLayout footerPrompt="Remembered your password?" footerLinkText="Sign in" footerLinkTo="/login">

                <AuthHeader
                    icon={MailCheck}
                    title="Reset password"
                    subtitle="First, enter the code sent to your email address"
                    email={email}
                    onEditEmail={() => { setStep("email"); setOtp(""); setOtpError(""); }}
                />

                <form onSubmit={handleOtpSubmit} className='flex flex-col items-center w-full'>

                    <CustomOtpInput
                        value={otp}
                        onChange={handleOtpChange}
                        length={6}
                        disabled={loading}
                        onFilled={handleOnFilled}
                        error={otpError}
                    />

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || loading}
                        className="login-body text-[13px] mt-6 mx-auto text-(--clerk-color-primary) disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0
                            ? <>Didn't receive a code? <span className="">Resend ({resendCooldown}s)</span></>
                            : <>Didn't receive a code? <span className="font-medium hover:underline">Resend</span></>
                        }
                    </button>

                    <Button
                        type="submit"
                        fullWidth
                        endIcon={<StepForward size={15} />}
                        loading={loading}
                        loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                        variant="contained"
                        disableElevation
                        sx={submitButtonSx}
                    >
                        Continue
                    </Button>

                </form>

            </AuthLayout>

        );

    }

    // ---------- Step 1 UI (default) ----------
    return (

        <AuthLayout footerPrompt="Remembered your password?" footerLinkText="Sign in" footerLinkTo="/login">

            <div className="login-animate flex flex-col items-stretch gap-10">

                <AuthHeader
                    icon={ShoppingBag}
                    title="Forgot password?"
                    subtitle="Enter your email and we'll send you a reset code."
                />

                <form onSubmit={handleEmailSubmit} className="w-full flex flex-col justify-start items-stretch gap-4">

                    <AuthField
                        id="email"
                        label="Email address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                        disabled={loading}
                        placeholder="Enter your email address"
                        error={emailError}
                    />

                    <div className='mt-2'>
                        <Button
                            type="submit"
                            fullWidth
                            endIcon={<StepForward size={15} />}
                            disabled={loading}
                            loading={loading}
                            loadingIndicator={<Loader2 size={16} className="animate-spin" />}
                            variant="contained"
                            disableElevation
                            sx={submitButtonSx}
                        >
                            Send reset code
                        </Button>
                    </div>

                    <Link to="/login" className="login-body text-sm text-center text-clerk-muted-foreground hover:underline mt-1">
                        Back
                    </Link>

                </form>

            </div>

        </AuthLayout>

    );

};

export default ForgotPassword;