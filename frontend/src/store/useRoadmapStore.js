import { create } from 'zustand';
import { axiosInstance } from '../libs/axios';
import toast from 'react-hot-toast';

export const useRoadmapStore = create((set) => ({
    roadmap: null,
    loading: false,

    fetchRoadmap: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get('/ai');
            set({ roadmap: res.data.roadmap });
        } catch (error) {
            console.error('Fetch Roadmap Error:', error);
            if (error?.response?.status === 501) {
                toast.error('AI roadmap is not enabled on backend yet');
            }
        } finally {
            set({ loading: false });
        }
    },

    generateRoadmap: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post('/ai/generate');
            set({ roadmap: res.data.roadmap });
            toast.success('AI Roadmap generated successfully!');
        } catch (error) {
            console.error('Generate Roadmap Error:', error);
            if (error?.response?.status === 501) {
                toast.error('AI roadmap is not enabled on backend yet');
            } else {
                toast.error('Failed to generate roadmap');
            }
        } finally {
            set({ loading: false });
        }
    }
}));
