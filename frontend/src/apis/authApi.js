// import api from "./axiosClient.js";

// // Each function throws the raw axios error on failure - the caller (component)
// // decides how to surface it (toast, inline field error, etc).

// export async function loginUser({ email, password }) {
//     const { data } = await api.post("/api/auth/login", { email, password });
//     return data; // { access_token, token_type, user }
// }

// export async function registerUser({ email, password, full_name }) {
//     const { data } = await api.post("/api/auth/register", { email, password, full_name });
//     return data;
// }

// export async function googleLogin({ idToken }) {
//     const { data } = await api.post("/api/auth/google", { id_token: idToken });
//     return data;
// }

// export async function logoutUser() {
//     const { data } = await api.post("/api/auth/logout"); 
//     return data;
// }

// export async function getCurrentUser() {
//     const { data } = await api.get("/api/auth/me");
//     return data;
// }

// // Helper to extract a human-readable message from a FastAPI error response.
// // FastAPI validation errors (422) come back as detail: [{msg, loc, ...}],
// // our own HTTPExceptions come back as detail: "some string".
// export function getErrorMessage(error) {
//     const detail = error?.response?.data?.detail;
//     if (!detail) return "Something went wrong. Please try again.";
//     if (typeof detail === "string") return detail;
//     if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
//     return "Something went wrong. Please try again.";
// }



// export const sendOtp = async () => {
//     return
// }

// export const verifyOtp = async () => {
//     return
// }

// export const registerSendOtp = async () => {
//     return
// }





// export const login = ({ email, password }) =>
//     api.post("/api/auth/login", { email, password });

// export const register = ({ username, email, password }) => 
//     api.post("/api/auth/signup", { email, password, username: username });


// export const forgotPassword = (email) =>
//     api.post("/api/auth/forgot-password", { email });  


// // tumhare existing `forgotPassword` ke pattern ko match karta hua
// export const verifyResetOtp = (email, otp) =>
//     api.post("/api/auth/verify-reset-otp", { email, otp }).then((res) => res.data);


// export const resetPassword = (email, newPassword) =>
//     api.post("/api/auth/reset-password", { email, new_password: newPassword }).then((res) => res.data);


// export const googleAuth = (idToken) =>
//     api.post("/api/auth/google", { id_token: idToken });

// export const logout = (user_id) => api.post("/api/auth/logout", { user_id });

// export const getMe = () => api.post("/api/auth/me");




// export const verifyEmail = ({ email, otp }) =>
//     api.post("/api/auth/verify-email", { email, otp });

// export const resendVerificationOtp = (email) =>
//     api.post("/api/auth/resend-verification-otp", { email });




// export const getUsage = () => {

// } 

// export const updateProfile = () => {

// }













import api from "./axiosClient.js";

// Each function throws the raw axios error on failure - the caller (component)
// decides how to surface it (toast, inline field error, etc).

export async function loginUser({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
}

export async function registerUser({ email, password, full_name }) {
    const { data } = await api.post("/api/auth/register", { email, password, full_name });
    return data;
}

export async function googleLogin({ idToken }) {
    const { data } = await api.post("/api/auth/google", { id_token: idToken });
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

// Backend ke error responses do shapes mein aate hain:
//  - AppException / validation errors  -> { success:false, error:{code,message,fields} }
//  - raw FastAPI HTTPException(detail=...) -> { detail: "..." } ya { detail:{message} } ya { detail:[{msg}] }
// Dono ko handle karta hai, taaki jahan bhi backend abhi raw HTTPException
// use kar raha hai wahan bhi sahi message dikhe.
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

export const sendOtp = async () => {
    return
}

export const verifyOtp = async () => {
    return
}

export const registerSendOtp = async () => {
    return
}

export const login = ({ email, password }) =>
    api.post("/api/auth/login", { email, password });

export const register = ({ username, email, password }) =>
    api.post("/api/auth/signup", { email, password, username: username });

export const forgotPassword = (email) =>
    api.post("/api/auth/forgot-password", { email }); 

export const verifyResetOtp = (email, otp) =>
    api.post("/api/auth/verify-reset-otp", { email, otp }).then((res) => res.data);

export const resetPassword = (email, newPassword) =>
    api.post("/api/auth/reset-password", { email, new_password: newPassword }).then((res) => res.data);

export const googleAuth = (idToken) =>
    api.post("/api/auth/google", { id_token: idToken });

export const logout = () => api.post("/api/auth/logout");

export const getMe = () => api.post("/api/auth/me");

export const verifyEmail = ({ email, otp }) =>
    api.post("/api/auth/verify-email", { email, otp });

export const resendVerificationOtp = (email) =>
    api.post("/api/auth/resend-verification-otp", { email });

// GET /api/auth/usage response ab UNWRAPPED aata hai (auth.py ke baaki
// routes jaisa — { documents:{used,total}, questions:{used,total} },
// koi { data: ... } wrapper nahi, notebooks.py wale routes se alag).
export const getUsage = () => api.get("/api/auth/usage");

// PATCH /api/auth/me — { username } expect karta hai
export const updateProfile = (payload) => api.patch("/api/auth/me", payload);