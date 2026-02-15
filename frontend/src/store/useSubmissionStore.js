import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set, get) => ({
  isLoading: false,
  submissions: [],
  submission: null,
  submissionCount: null,

  getAllSubmissions: async (userId) => {
    try {
      set({ isLoading: true });
      const url = userId
        ? `/submissions/get-all-submissions?userId=${userId}`
        : "/submissions/get-all-submissions";
      const res = await axiosInstance.get(url);

      set({ submissions: res.data.submissions });

    } catch (error) {
      console.log("Error getting all submissions", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(
        `/submissions/get-submissions/${problemId}`
      );

      set({ submission: res.data.submissions });



    } catch (error) {
      console.log("Error getting submissions for problem", error);

      toast.error("Error getting submissions for problem");

    } finally {
      set({ isLoading: false });
    }
  },

  getSubmissionCountForProblem: async (problemId) => {
    try {
      const res = await axiosInstance.get(
        `/submissions/get-submissions-count/${problemId}`
      );

      set({ submissionCount: res.data.count });
    } catch (error) {
      console.log("Error getting submission count for problem", error);
      toast.error("Error getting submission count for problem");
    }
  },

  getSubmissionDetails: async (submissionId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(
        `/submissions/get-submission-details/${submissionId}`
      );
      set({ submission: res.data.submission });
    } catch (error) {
      console.log("Error getting submission details", error);
      toast.error("Error getting submission details");
    } finally {
      set({ isLoading: false });
    }
  },
}));
