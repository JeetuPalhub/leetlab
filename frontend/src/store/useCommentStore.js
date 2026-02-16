import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

export const useCommentStore = create((set, get) => ({
    comments: [],
    isLoading: false,
    pagination: {
        totalComments: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasMore: false,
    },
    lastFetched: 0,

    getComments: async (problemId, page = 1, limit = 10, append = false) => {
        const now = Date.now();
        const { lastFetched, comments } = get();

        // Cache: 1 minute for the first page
        if (!append && page === 1 && comments.length > 0 && now - lastFetched < 60000) {
            return;
        }

        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/comments/${problemId}?page=${page}&limit=${limit}`);

            if (append) {
                set((state) => ({
                    comments: [...state.comments, ...res.data.comments],
                    pagination: res.data.pagination,
                    lastFetched: now,
                }));
            } else {
                set({
                    comments: res.data.comments,
                    pagination: res.data.pagination,
                    lastFetched: now,
                });
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addComment: async (problemId, content, parentId = null) => {
        try {
            const res = await axiosInstance.post("/comments/create", {
                problemId,
                content,
                parentId
            });

            // If it's a top-level comment, refetch first page to show it
            // If it's a reply, we might need a different strategy, but for now reset first page
            const now = Date.now();
            const commentsRes = await axiosInstance.get(`/comments/${problemId}?page=1&limit=10`);
            set({
                comments: commentsRes.data.comments,
                pagination: commentsRes.data.pagination,
                lastFetched: now
            });

            toast.success("Comment added");
            return res.data.comment;
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        }
    },

    deleteComment: async (commentId, problemId) => {
        try {
            await axiosInstance.delete(`/comments/${commentId}`);

            // Reset to first page
            const now = Date.now();
            const commentsRes = await axiosInstance.get(`/comments/${problemId}?page=1&limit=10`);
            set({
                comments: commentsRes.data.comments,
                pagination: commentsRes.data.pagination,
                lastFetched: now
            });

            toast.success("Comment deleted");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        }
    },
}));
