import { create } from 'zustand';
import { axiosInstance } from '../libs/axios';
import toast from 'react-hot-toast';

export const useContestStore = create((set, get) => ({
    contests: [],
    currentContest: null,
    leaderboard: [],
    loading: false,

    fetchContests: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get('/contest');
            set({ contests: res.data });
        } catch (error) {
            console.error('Fetch Contests Error:', error);
            if (error?.response?.status === 501) {
                toast.error('Contests are not enabled on backend yet');
            } else {
                toast.error('Failed to load contests');
            }
        } finally {
            set({ loading: false });
        }
    },

    fetchContestById: async (id) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get(`/contest/${id}`);
            set({ currentContest: res.data });
            return res.data;
        } catch (error) {
            console.error('Fetch Contest Error:', error);
            if (error?.response?.status === 501) {
                toast.error('Contests are not enabled on backend yet');
            } else {
                toast.error('Failed to load contest details');
            }
        } finally {
            set({ loading: false });
        }
    },

    registerForContest: async (id) => {
        try {
            const res = await axiosInstance.post(`/contest/${id}/register`);
            toast.success('Successfully registered for contest!');
            // Refresh contest details to update registration status
            get().fetchContestById(id);
            return res.data;
        } catch (error) {
            console.error('Register Contest Error:', error);
            if (error?.response?.status === 501) {
                toast.error('Contests are not enabled on backend yet');
            } else {
                toast.error(error.response?.data?.error || 'Registration failed');
            }
        }
    },

    fetchLeaderboard: async (id) => {
        try {
            const res = await axiosInstance.get(`/contest/${id}/leaderboard`);
            set({ leaderboard: res.data });
        } catch (error) {
            console.error('Leaderboard Error:', error);
            if (error?.response?.status === 501) {
                toast.error('Contests are not enabled on backend yet');
            } else {
                toast.error('Failed to load leaderboard');
            }
        }
    },

    createContest: async (contestData) => {
        try {
            const res = await axiosInstance.post(`/contest/create`, contestData);
            toast.success('Contest created successfully!');
            get().fetchContests();
            return res.data;
        } catch (error) {
            console.error('Create Contest Error:', error);
            if (error?.response?.status === 501) {
                toast.error('Contests are not enabled on backend yet');
            } else {
                toast.error(error.response?.data?.error || 'Failed to create contest');
            }
        }
    }

}));
