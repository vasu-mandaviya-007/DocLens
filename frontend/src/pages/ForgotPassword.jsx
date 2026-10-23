
import { Button } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { forgotPassword, verifyResetOtp, resetPassword } from "../apis/authApi.js";
import { parseApiError } from "../utils/errorHandler.js";
import { OTP_LENGTH, OTP_REGEX, RESEND_COOLDOWN_SECONDS } from "../constants/auth.js";
import { useResendCooldown } from "../hooks/useResendCooldown.js";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import PasswordField, { isPasswordValid } from "../components/auth/PasswordField.jsx";
import { Loader2, MailCheck, ShoppingBag, KeyRound, StepForward } from "lucide-react";
import CustomOtpInput from "../components/auth/CustomOtpInput.jsx";
import AuthHeader from "../components/auth/AuthHeader.jsx";
import { submitButtonSx } from "../utils/submitButtonSx.jsx";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState("email");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    const {
        secondsLeft: resendCooldown,
        checking: checkingCooldown,
        start: startResendCooldown,
    } = useResendCooldown("reset", email, step === "otp");

    const [resetToken, setResetToken] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    // ---------- Step 1: Email ----------
    const handleEmailSubmit = async (e) => {
        e?.preventDefault?.();
        if (loading) return;
        if (!email) {
            setEmailError("Email is required");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setStep("otp");
            startResendCooldown(RESEND_COOLDOWN_SECONDS);
            toast.success("If an account exists, a code has been sent.");
        } catch (err) {
            const { message, fields } = parseApiError(err);
            if (fields?.email) {
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

    const submitOtp = async (code) => {
        if (loading) return;

        if (!OTP_REGEX.test(code)) {
            setOtpError(`Enter the ${OTP_LENGTH}-digit code`);
            return;
        }

        setLoading(true);
        try {
            const data = await verifyResetOtp(email, code);
            setResetToken(data.reset_token);
            setStep("reset");
        } catch (err) {
            const { message, fields } = parseApiError(err);
            setOtpError(fields?.otp || message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || checkingCooldown || loading) return;
        setLoading(true);
        try {
            await forgotPassword(email);
            startResendCooldown(RESEND_COOLDOWN_SECONDS);
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
        if (loading) return;

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
            await resetPassword({ email, resetToken, newPassword });
            toast.success("Password reset successful. Please sign in.");
            navigate("/login");
        } catch (err) {
            const { message, fields } = parseApiError(err);

            if (fields?.otp || fields?.reset_token) {
                toast.error(fields.otp || "Verification expired. Please request a new code.");
                setResetToken("");
                setStep("otp");
                setOtp("");
            } else if (fields?.new_password) {
                setPasswordError(fields.new_password);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // ---------- Step 3 UI ----------
    if (step === "reset") {
        return (
            <AuthLayout footerPrompt="Remembered your password?" footerLinkText="Sign in" footerLinkTo="/login">
                <div className="flex py-2 flex-col items-center gap-8">
                    <AuthHeader
                        icon={KeyRound}
                        title="Set new password"
                        subtitle="Choose a strong password for your account."
                    />

                    <form onSubmit={handleResetSubmit} className="w-full flex flex-col gap-6">
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
                            className="mt-4!"
                            disableElevation
                            sx={submitButtonSx}
                        >
                            Reset password
                        </Button>
                    </form>
                </div>
            </AuthLayout>
        );
    }

    // ---------- Step 2 UI ----------
    if (step === "otp") {
        return (
            <AuthLayout footerPrompt="Remembered your password?" footerLinkText="Sign in" footerLinkTo="/login">
                <div key="step2" className="flex py-2 flex-col items-center gap-8">
                    <AuthHeader
                        icon={MailCheck}
                        title="Reset password"
                        subtitle="First, enter the code sent to your email address"
                        email={email}
                        onEditEmail={() => {
                            setStep("email");
                            setOtp("");
                            setOtpError("");
                        }}
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
                                disabled={resendCooldown > 0 || checkingCooldown || loading}
                                className="login-body text-[13px] mx-auto text-(--clerk-color-primary) disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? (
                                    <>
                                        Didn't receive a code? <span>Resend ({resendCooldown}s)</span>
                                    </>
                                ) : (
                                    <>
                                        Didn't receive a code? <span className="font-medium hover:underline">Resend</span>
                                    </>
                                )}
                            </button>
                        </div>

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
                </div>
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
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                        }}
                        disabled={loading}
                        placeholder="Enter your email address"
                        error={emailError}
                    />

                    <div className="mt-2">
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

                    <Link
                        to="/login"
                        className="login-body text-sm text-center text-clerk-muted-foreground hover:underline mt-1"
                    >
                        Back
                    </Link>
                </form>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;






