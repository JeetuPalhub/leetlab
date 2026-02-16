import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useLeaderboardStore = create((set) => ({
    leaderboard: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasMore: false,
    },
    myRank: null,
    isLoading: false,
    lastFetched: 0,

    getLeaderboard: async (page = 1, limit = 50, append = false) => {
        const now = Date.now();
        const { lastFetched, leaderboard } = get();
        if (!append && page === 1 && leaderboard.length > 0 && now - lastFetched < 60000) {
            return;
        }

        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/leaderboard?page=${page}&limit=${limit}`);
            if (append) {
                set((state) => ({
                    leaderboard: [...state.leaderboard, ...res.data.leaderboard],
                    pagination: res.data.pagination,
                    lastFetched: now,
                }));
            } else {
                set({
                    leaderboard: res.data.leaderboard,
                    pagination: res.data.pagination,
                    lastFetched: now,
                });
            }
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
