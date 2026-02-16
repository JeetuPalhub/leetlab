import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set, get) => ({
  isLoading: false,
  submissions: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalSubmissions: 0,
    hasMore: false,
  },
  submission: null,
  submissionCount: null,
  lastFetched: 0,

  getAllSubmissions: async (userId, page = 1, limit = 10, append = false) => {
    const now = Date.now();
    const { lastFetched, submissions } = get();
    if (!append && page === 1 && submissions.length > 0 && now - lastFetched < 60000) {
      return;
    }

    try {
      set({ isLoading: true });
      let url = `/submissions/get-all-submissions?page=${page}&limit=${limit}`;
      if (userId) url += `&userId=${userId}`;

      const res = await axiosInstance.get(url);

      if (append) {
        set((state) => ({
          submissions: [...state.submissions, ...res.data.submissions],
          pagination: res.data.pagination,
          lastFetched: now,
        }));
      } else {
        set({
          submissions: res.data.submissions,
          pagination: res.data.pagination,
          lastFetched: now,
        });
      }

    } catch (error) {
      console.log("Error getting all submissions", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getSubmissionForProblem: async (problemId, page = 1, limit = 10, append = false) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(
        `/submissions/get-submissions/${problemId}?page=${page}&limit=${limit}`
      );

      if (append) {
        set((state) => ({
          submission: [...(Array.isArray(state.submission) ? state.submission : []), ...res.data.submissions],
          pagination: res.data.pagination,
        }));
      } else {
        set({
          submission: res.data.submissions,
          pagination: res.data.pagination
        });
      }
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
