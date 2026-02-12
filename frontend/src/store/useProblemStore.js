
import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useProblemStore = create((set, get) => ({
  isProblemLoading: false,
  isProblemsLoading: false,
  problems: [],
  problem: null,
  solvedProblems: [],

  getAllProblems: async () => {
    try {
      set({ isProblemsLoading: true });
      const res = await axiosInstance.get("/problems/get-all-problems");

      set({ problems: res.data.problems });


    } catch (error) {
      console.log("Error getting all problems", error);
      toast.error("Error getting all problems");
    } finally {
      set({ isProblemsLoading: false });
    }
  },

  getProblemById: async (id) => {
    try {
      set({ isProblemLoading: true });
      const res = await axiosInstance.get(`/problems/get-problem/${id}`);

      set({ problem: res.data.problem });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error getting problem", error);
      toast.error("Error getting problem");
    } finally {
      set({ isProblemLoading: false });
    }
  },

  getSolvedProblemByUser: async (userId) => {
    try {
      const url = userId ? `/problems/get-solved-problem?userId=${userId}` : "/problems/get-solved-problem";
      const res = await axiosInstance.get(url);

      set({ solvedProblems: res.data.problems || [] });
    } catch (error) {
      console.log("Error getting solved problems", error);
    }
  },
  dailyChallenge: null,
  isChallengeLoading: false,

  getDailyChallenge: async () => {
    try {
      set({ isChallengeLoading: true });
      const res = await axiosInstance.get("/challenges/today");
      set({ dailyChallenge: res.data.challenge });
    } catch (error) {
      console.log("Error getting daily challenge", error);
    } finally {
      set({ isChallengeLoading: false });
    }
  },

  createProblem: async (problemData) => {
    try {
      set({ isProblemLoading: true });
      const res = await axiosInstance.post("/problems/create-problem", problemData);
      toast.success(res.data.message || "Problem created successfully");
      return res.data;
    } catch (error) {
      console.log("Error creating problem", error);
      toast.error(error.response?.data?.message || "Error creating problem");
      throw error;
    } finally {
      set({ isProblemLoading: false });
    }
  },

}));
