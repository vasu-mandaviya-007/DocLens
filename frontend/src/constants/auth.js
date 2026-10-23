
export const OTP_LENGTH = Number(import.meta.env.VITE_OTP_LENGTH) || 6;
export const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);


export const RESEND_COOLDOWN_SECONDS = 60;


export const OAUTH_ERROR_MESSAGES = {
    google_auth_failed: "Google sign-in failed. Please try again.",
    github_auth_failed: "GitHub sign-in failed. Please try again.",
    no_verified_email: "Your GitHub account has no verified email. Verify one on GitHub and try again.",
    account_deactivated: "This account has been deactivated.",
};