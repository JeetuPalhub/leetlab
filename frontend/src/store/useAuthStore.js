import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";


export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigninUp: false,
    isLoggingIn: false,
    isCheckingAuth: false,
    profileData: null,
    isProfileLoading: false,

    getProfileData: async (userId) => {
        try {
            set({ isProfileLoading: true });
            const url = userId ? `/user/profile-data?userId=${userId}` : "/user/profile-data";
            const res = await axiosInstance.get(url);
            set({ profileData: res.data.data });
        } catch (error) {
            console.log("Error fetching profile data", error);
            toast.error("Failed to load profile insights");
        } finally {
            set({ isProfileLoading: false });
        }
    },

    // Set auth user directly (for profile updates)
    setAuthUser: (user) => set({ authUser: user }),

    checkAuth: async () => {
        set({ isCheckingAuth: true }); // ✅ FIXED

        try {
            const res = await axiosInstance.get("/auth/check");
            console.log("✅ checkAuth response:", res.data);
            set({ authUser: res.data.user });
        } catch (error) {
            console.log("❌ Error checking auth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    }
    ,


    signup: async (data) => {
        set({ isSigninUp: true });
        try {
            const res = await axiosInstance.post("/auth/register", data);

            set({ authUser: res.data.user });

            toast.success(res.data.message);
        } catch (error) {
            console.log("Error signing up", error);
            const errorMessage = error.response?.data?.error || "Error signing up";
            toast.error(errorMessage);
        }
        finally {
            set({ isSigninUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);

            set({ authUser: res.data.user });

            toast.success(res.data.message);

        } catch (error) {
            console.log("Error logging in", error);
            const errorMessage = error.response?.data?.error || "Error logging in";
            toast.error(errorMessage);
        }
        finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });

            toast.success("Logout successful");
        } catch (error) {
            console.log("Error logging out", error);
            toast.error("Error logging out");
        }
    }


}))