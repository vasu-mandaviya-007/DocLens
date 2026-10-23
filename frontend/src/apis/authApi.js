import api from "./axiosClient.js";


export async function loginUser({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
}

export async function logoutUser() {
    const { data } = await api.post("/api/auth/logout");
    return data;
}

export async function getCurrentUser() {
    const { data } = await api.get("/api/auth/me");
    return data;
}


export function getErrorMessage(error) {
    const data = error?.response?.data;
    if (!data) return "Something went wrong. Please try again.";

    if (data.error?.message) return data.error.message;

    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (detail?.message) return detail.message;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;

    return "Something went wrong. Please try again.";
}

export const login = ({ email, password }) =>
    api.post("/api/auth/login", { email, password });


export const register = ({ username, email, password }) =>
    api.post("/api/auth/signup", { email, password, username });


export const forgotPassword = (email) =>
    api.post("/api/auth/forgot-password", { email });


export const verifyResetOtp = (email, otp) =>
    api.post("/api/auth/verify-reset-otp", { email, otp }).then((res) => res.data);


export const resetPassword = ({ email, resetToken, newPassword }) =>
    api
        .post("/api/auth/reset-password", {
            email,
            reset_token: resetToken,
            new_password: newPassword,
        })
        .then((res) => res.data);


export const logout = () => api.post("/api/auth/logout");


export const getMe = () => api.get("/api/auth/me");


export const verifyEmail = ({ email, otp }) =>
    api.post("/api/auth/verify-email", { email, otp });


export const resendVerificationOtp = (email) =>
    api.post("/api/auth/resend-verification-otp", { email });


export const getUsage = () => api.get("/api/auth/usage");


export const updateProfile = (payload) => api.patch("/api/auth/me", payload);


export const getOtpCooldown = (email, purpose) =>
    api.post("/api/auth/otp-cooldown", { email, purpose }).then((res) => res.data);
