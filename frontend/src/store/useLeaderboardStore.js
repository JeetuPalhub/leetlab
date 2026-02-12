import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useLeaderboardStore = create((set) => ({
    leaderboard: [],
    myRank: null,
    isLoading: false,

    getLeaderboard: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/leaderboard");
            set({ leaderboard: res.data.leaderboard });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            if (error?.response?.status === 501) {
                toast.error("Leaderboard is not enabled on backend yet");
            } else {
                toast.error("Failed to load leaderboard");
            }
        } finally {
            set({ isLoading: false });
        }
    },

    getMyRank: async () => {
        try {
            const res = await axiosInstance.get("/leaderboard/my-rank");
            set({ myRank: res.data });
        } catch (error) {
            console.error("Error fetching my rank:", error);
            if (error?.response?.status === 501) {
                toast.error("Leaderboard is not enabled on backend yet");
            }
        }
    },
}));
