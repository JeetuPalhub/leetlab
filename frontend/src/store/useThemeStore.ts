import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark', // Default to dark mode

            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },

            toggleTheme: () => {
                const currentTheme = get().theme;
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                set({ theme: newTheme });
                applyTheme(newTheme);
            },
        }),
        {
            name: 'leetlab-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

function applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'night' : 'winter');
    } else {
        root.setAttribute('data-theme', theme === 'dark' ? 'night' : 'winter');
    }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('leetlab-theme');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            applyTheme(state?.theme || 'dark');
        } catch {
            applyTheme('dark');
        }
    } else {
        applyTheme('dark');
    }
}
