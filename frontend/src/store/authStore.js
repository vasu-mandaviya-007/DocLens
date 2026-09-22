import { create } from "zustand"
import api from "../apis/axiosClient.js";
import { logout } from "../apis/authApi.js";
import toast from "react-hot-toast";


export const useAuthStore = create((set, get) => ({

    user: null,
    authLoading: true,
    isAuthenticated: false,
    isCheckingAuth: true,

    setAuth: ({ user }) => (
        set({ user, isAuthenticated: true, isCheckingAuth: false })
    ),

    setCheckingAuth: (value) => set({ isCheckingAuth: value }),

    clearAuth: () => (
        set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
        })
    ),

    fetchUser: async () => {

        set({ authLoading: true });

        try {
            const res = await api.post('/api/auth/me');
            set({ user: res.data, isAuthenticated: true });
        } catch (err) {
            const isNetworkIssue = err.isNetworkError || err.code === 'ERR_NETWORK' || !err.response;

            if (isNetworkIssue) {
                if (import.meta.env.DEV) console.log("Network issue — keeping existing session state.");
            } else if (err.response?.status === 401) {
                if (import.meta.env.DEV) console.log("Invalid session (401), clearing user...");
                set({ user: null });
            } else {
                if (import.meta.env.DEV) console.log(`Non-auth error (${err.response?.status}) — keeping session active.`);
                console.log(err.response);
            }
        } finally {
            set({ authLoading: false });
        }
    },

    handleLogout: async () => {

        try {
            await logout();
            set({ user: null, isAuthenticated: false })
            toast.success("Logout Successfully.");
        } catch (err) {
            console.log(err)
        }

    }

})) 