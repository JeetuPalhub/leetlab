import { create } from "zustand";
import toast from "react-hot-toast";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Rate limit tracking
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests (Groq allows 30/min)

// Helper to call Groq API
const callGroq = async (prompt, { temperature = 0.7, maxTokens = 300 } = {}) => {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY_MISSING");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || "";

        if (response.status === 429 || errorMsg.includes("rate") || errorMsg.includes("limit")) {
            throw new Error("RATE_LIMITED");
        }
        throw new Error(errorMsg || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Unable to generate response.";
};

export const useAIStore = create((set, get) => ({
    hint: null,
    suggestion: null,
    solution: null,
    isLoadingHint: false,
    isLoadingSuggestion: false,
    isLoadingSolution: false,
    error: null,
    lastRequestTime: 0,

    // Get a hint for the current problem
    getHint: async (problemDescription, userCode, language) => {
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            toast.error(`Please wait ${waitTime}s before requesting another hint`);
            return;
        }

        set({ isLoadingHint: true, error: null, hint: null });

        try {
            lastRequestTime = Date.now();

            const prompt = `You are a helpful coding tutor. Give a SHORT hint (2-3 sentences max) for this problem without giving away the solution:

Problem: ${problemDescription?.substring(0, 500) || "No description"}

Language: ${language}

Focus on algorithm approach or key concept. Do not provide code.`;

            const hintText = await callGroq(prompt, { temperature: 0.7, maxTokens: 150 });
            toast.success("Hint generated!");
            set({ hint: hintText, isLoadingHint: false });
        } catch (error) {
            if (error.message === "GROQ_API_KEY_MISSING") {
                toast.error("Groq API key not configured");
                set({
                    hint: "💡 AI hints are not configured. Add VITE_GROQ_API_KEY to your .env.local file.\n\nGet a free key at: https://console.groq.com (no credit card needed)",
                    isLoadingHint: false
                });
                return;
            }
            if (error.message === "RATE_LIMITED") {
                toast.error("Rate limited. Wait a few seconds and try again.");
                set({ hint: "⏱️ Rate limited. Please wait a few seconds.", isLoadingHint: false, error: "rate_limit" });
                return;
            }
            console.error("AI Hint Error:", error);
            toast.error(`Error: ${error.message}`);
            set({ hint: `Unable to get AI hint: ${error.message}`, isLoadingHint: false, error: error.message });
        }
    },

    // Get full solution
    getSolution: async (problemDescription, language) => {
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            toast.error(`Please wait ${waitTime}s before requesting another solution`);
            return;
        }

        set({ isLoadingSolution: true, error: null, solution: null });

        try {
            lastRequestTime = Date.now();

            const prompt = `You are an expert coding interviewer. Provide a COMPLETE, OPTIMAL solution for this problem in ${language}.
            
Problem: ${problemDescription?.substring(0, 800) || "No description"}

Rules:
1. Provide ONLY the code. No markdown, no explanations outside comments.
2. Include brief comments explaining the logic.
3. The code must be ready to run.
`;

            let solutionText = await callGroq(prompt, { temperature: 0.2, maxTokens: 1000 });

            // Clean up markdown code blocks if present
            solutionText = solutionText.replace(/```\w*\n/g, "").replace(/```/g, "");

            toast.success("Solution generated!");
            set({ solution: solutionText, isLoadingSolution: false });
        } catch (error) {
            if (error.message === "GROQ_API_KEY_MISSING") {
                toast.error("Groq API key not configured");
                set({ solution: "// AI not configured. Add VITE_GROQ_API_KEY to .env.local\n// Get free key: https://console.groq.com", isLoadingSolution: false });
                return;
            }
            if (error.message === "RATE_LIMITED") {
                toast.error("Rate limited. Wait a few seconds.");
                set({ solution: "// Rate limited. Please wait a few seconds.", isLoadingSolution: false, error: "rate_limit" });
                return;
            }
            console.error("AI Solution Error:", error);
            toast.error(`Error: ${error.message}`);
            set({ solution: `// Error: ${error.message}`, isLoadingSolution: false, error: error.message });
        }
    },

    // Get code suggestions/improvements
    getSuggestion: async (problemDescription, userCode, language) => {
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            toast.error(`Please wait ${waitTime}s before requesting another review`);
            return;
        }

        if (!userCode || userCode.trim().length < 10) {
            toast.error("Write some code first before requesting a review");
            return;
        }

        set({ isLoadingSuggestion: true, error: null, suggestion: null });

        try {
            lastRequestTime = Date.now();

            const prompt = `Review this ${language} code briefly (3-4 points max):

Code:
${userCode.substring(0, 1000)}

Check: 1) Bugs? 2) Complexity issues? 3) One improvement?
Keep each point to 1-2 sentences.`;

            const suggestionText = await callGroq(prompt, { temperature: 0.7, maxTokens: 300 });
            toast.success("Code review complete!");
            set({ suggestion: suggestionText, isLoadingSuggestion: false });
        } catch (error) {
            if (error.message === "GROQ_API_KEY_MISSING") {
                set({ suggestion: "💡 AI not configured. Add VITE_GROQ_API_KEY to .env.local\n\nGet free key: https://console.groq.com", isLoadingSuggestion: false });
                return;
            }
            if (error.message === "RATE_LIMITED") {
                toast.error("Rate limited. Wait a few seconds.");
                set({ suggestion: "⏱️ Rate limited. Please wait a few seconds.", isLoadingSuggestion: false, error: "rate_limit" });
                return;
            }
            console.error("AI Suggestion Error:", error);
            toast.error(`Error: ${error.message}`);
            set({ suggestion: `Unable to get review: ${error.message}`, isLoadingSuggestion: false, error: error.message });
        }
    },

    // Clear hints and suggestions
    clearAI: () => set({ hint: null, suggestion: null, solution: null, error: null }),
}));
