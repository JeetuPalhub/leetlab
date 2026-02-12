import { Request, Response } from "express";
import { db } from "../libs/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateAIRoadmap = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = req.user.id;

        // 1. Fetch user performance data
        const solvedProblems = await db.problemSolved.findMany({
            where: { userId },
            include: {
                problem: {
                    select: {
                        difficulty: true,
                        tags: true
                    }
                }
            }
        });

        // 2. Summarize findings for AI
        const stats = solvedProblems.reduce((acc: any, curr: any) => {
            const diff = curr.problem.difficulty;
            acc[diff] = (acc[diff] || 0) + 1;
            curr.problem.tags.forEach((tag: string) => {
                acc.tags[tag] = (acc.tags[tag] || 0) + 1;
            });
            return acc;
        }, { EASY: 0, MEDIUM: 0, HARD: 0, tags: {} });

        const topTags = Object.entries(stats.tags)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5);

        let roadmapContent: unknown = DUMMY_ROADMAP;
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            // 3. Prompt engineering for Gemini
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
                You are a world-class competitive programming coach. 
                Analyze this student's performance data and generate a personalized 4-step learning roadmap.
                
                Student Stats:
                - Easy problems solved: ${stats.EASY}
                - Medium problems solved: ${stats.MEDIUM}
                - Hard problems solved: ${stats.HARD}
                - Top Tags: ${JSON.stringify(topTags)}
                
                Return a JSON object with this structure:
                {
                    "assessment": "A single sentence summary of current skill level.",
                    "milestones": [
                        {
                            "id": 1,
                            "title": "Phase name",
                            "description": "Short objective",
                            "focusTags": ["Tag1", "Tag2"],
                            "difficultyRecommendation": "EASY/MEDIUM/HARD"
                        }
                    ],
                    "recommendedCategories": ["Category1", "Category2"]
                }
                
                Be encouraging but realistic. Focus on areas where they have few solutions.
            `;

            const result = await model.generateContent(prompt);
            roadmapContent = JSON.parse(result.response.text());
        }

        // 4. Save/Update roadmap in DB
        const roadmap = await db.aIRoadmap.upsert({
            where: { userId },
            create: {
                userId,
                content: roadmapContent as any
            },
            update: {
                content: roadmapContent as any
            }
        });

        res.json({
            success: true,
            roadmap
        });
    } catch (error) {
        console.error("Generate AI Roadmap Error:", error);
        res.status(500).json({ error: "Failed to generate personalized roadmap" });
    }
};

const DUMMY_ROADMAP = {
    assessment: "Based on your current activity, you're at the beginning of your journey. You need to build a strong foundation in core Data Structures.",
    milestones: [
        {
            id: 1,
            title: "Arrays & Strings Mastery",
            description: "Master the basics of array manipulation and string algorithms.",
            focusTags: ["Array", "String", "Two Pointers"],
            difficultyRecommendation: "EASY"
        },
        {
            id: 2,
            title: "Hash Maps & Sets",
            description: "Learn efficient data lookup and counting techniques.",
            focusTags: ["Hash Table", "Counting", "Sliding Window"],
            difficultyRecommendation: "EASY"
        },
        {
            id: 3,
            title: "Linked Lists & Recursion",
            description: "Understand pointers and recursive thinking.",
            focusTags: ["Linked List", "Recursion", "Stack"],
            difficultyRecommendation: "MEDIUM"
        },
        {
            id: 4,
            title: "Trees & Graphs",
            description: "Dive into hierarchical data structures and traversal algorithms.",
            focusTags: ["Tree", "BFS", "DFS", "Graph"],
            difficultyRecommendation: "MEDIUM"
        }
    ],
    recommendedCategories: ["Data Structures", "Algorithms", "Databases"]
};

export const getAIRoadmap = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        let roadmap = await db.aIRoadmap.findUnique({
            where: { userId: req.user.id }
        });

        if (!roadmap) {
            // Return dummy roadmap for new users or if generation fails/not run
            // @ts-ignore
            roadmap = { content: DUMMY_ROADMAP };
        }

        res.json({
            success: true,
            roadmap
        });
    } catch (error) {
        console.error("Get AI Roadmap Error:", error);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
};
