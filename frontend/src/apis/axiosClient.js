import axios from "axios"
import { useAuthStore } from "../store/authStore.js" 


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    withCredentials: true, // required so the browser sends/receives both httpOnly cookies
    headers: {
        "Content-Type": "application/json",
    },
})

// No request interceptor for Authorization headers anymore - the backend
// reads the access token from the httpOnly cookie, which the browser attaches
// to every request on its own. There is no token in JS memory to attach.

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    pendingQueue = [];
};

// Silent refresh: on a 401 (expired access token), try /api/auth/refresh once,
// then retry the original request. No token handling needed on our side -
// /refresh sets fresh cookies on success, and the browser automatically
// attaches the new access_token cookie when we retry.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config; 

        const isAuthEndpoint =
            originalRequest?.url?.includes("/api/auth/login") ||
            originalRequest?.url?.includes("/api/auth/register") ||
            originalRequest?.url?.includes("/api/auth/refresh");

        if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Another request already triggered a refresh - wait for it instead of firing again
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post("/api/auth/refresh"); // sets new access_token + refresh_token cookies
            processQueue(null);
            return api(originalRequest); // browser resends this with the fresh cookie automatically
        } catch (refreshError) {
            processQueue(refreshError);
            useAuthStore.getState().clearAuth();
            // Let the app know the session truly ended so it can redirect to /login
            window.dispatchEvent(new CustomEvent("doclens:session-expired"));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;