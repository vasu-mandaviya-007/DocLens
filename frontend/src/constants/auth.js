


// src/constants/auth.js

// Backend ke OTP_LENGTH ke barabar rakho: frontend .env me VITE_OTP_LENGTH set karo.
export const OTP_LENGTH = Number(import.meta.env.VITE_OTP_LENGTH) || 6;
export const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

// Backend ka resend cooldown 60s hai (otp_service.RESEND_COOLDOWN_SECONDS).
// Frontend isse kam rakhega to button khulega par backend naya email nahi bhejega.
export const RESEND_COOLDOWN_SECONDS = 60;

// Backend OAuth fail hone par /login?error=<code> pe redirect karta hai
export const OAUTH_ERROR_MESSAGES = {
    google_auth_failed: "Google sign-in failed. Please try again.",
    github_auth_failed: "GitHub sign-in failed. Please try again.",
    no_verified_email: "Your GitHub account has no verified email. Verify one on GitHub and try again.",
    account_deactivated: "This account has been deactivated.",
};