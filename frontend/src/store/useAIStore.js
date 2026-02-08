import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const useAIStore = create((set, get) => ({
    hint: null,
    suggestion: null,
    isLoadingHint: false,
    isLoadingSuggestion: false,
    error: null,

    // Get a hint for the current problem
    getHint: async (problemDescription, userCode, language) => {
        set({ isLoadingHint: true, error: null });

        try {
            if (!GEMINI_API_KEY) {
                set({
                    hint: "💡 AI hints are not configured. Add VITE_GEMINI_API_KEY to your .env file to enable AI features.",
                    isLoadingHint: false
                });
                return;
            }

            const prompt = `You are a helpful coding tutor. The student is working on this problem:

${problemDescription}

They are coding in ${language}. Their current code is:

\`\`\`${language}
${userCode || "// No code written yet"}
\`\`\`

Give them a SHORT, helpful hint (2-3 sentences max) without giving away the solution. Focus on the algorithm approach or a key concept they might be missing. Do not provide code.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get AI hint");
            }

            const data = await response.json();
            const hintText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate hint.";

            set({ hint: hintText, isLoadingHint: false });
        } catch (error) {
            console.error("AI Hint Error:", error);
            set({
                hint: "Unable to get AI hint. Please try again.",
                isLoadingHint: false,
                error: error.message
            });
        }
    },

    // Get code suggestions/improvements
    getSuggestion: async (problemDescription, userCode, language) => {
        set({ isLoadingSuggestion: true, error: null });

        try {
            if (!GEMINI_API_KEY) {
                set({
                    suggestion: "💡 AI suggestions are not configured. Add VITE_GEMINI_API_KEY to your .env file to enable AI features.",
                    isLoadingSuggestion: false
                });
                return;
            }

            const prompt = `You are a code reviewer. Analyze this ${language} code for the following problem:

Problem: ${problemDescription}

Code:
\`\`\`${language}
${userCode}
\`\`\`

Provide a BRIEF code review (3-4 points max):
1. Any bugs or logical errors?
2. Time/space complexity issues?
3. One specific improvement suggestion

Keep each point to 1-2 sentences. Be constructive.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 400,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get AI suggestion");
            }

            const data = await response.json();
            const suggestionText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate suggestions.";

            set({ suggestion: suggestionText, isLoadingSuggestion: false });
        } catch (error) {
            console.error("AI Suggestion Error:", error);
            set({
                suggestion: "Unable to get AI suggestions. Please try again.",
                isLoadingSuggestion: false,
                error: error.message
            });
        }
    },

    // Clear hints and suggestions
    clearAI: () => set({ hint: null, suggestion: null, error: null }),
}));
