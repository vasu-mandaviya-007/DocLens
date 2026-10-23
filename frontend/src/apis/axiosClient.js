import axios from "axios"
import { useAuthStore } from "../store/authStore.js" 


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json", 
    },
})


let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    pendingQueue = [];
};


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config; 

        const isAuthEndpoint =
            originalRequest?.url?.includes("/api/auth/login") ||
            originalRequest?.url?.includes("/api/auth/register") ||
            originalRequest?.url?.includes("/api/auth/refresh");

        if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
            console.log("yes");
            
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post("/api/auth/refresh");
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            useAuthStore.getState().clearAuth();
            window.dispatchEvent(new CustomEvent("doclens:session-expired"));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;