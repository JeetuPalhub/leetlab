import { Request, Response } from "express";
import { db } from "../libs/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const startInterview = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { duration = 60, difficulty, company } = req.body;
        const userId = req.user.id;

        // Fetch problems based on difficulty or company
        const where: any = {};
        if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
        if (company && company !== "ALL") where.companies = { has: company };

        // Get 3 random problems
        const problems = await db.problem.findMany({
            where,
            select: { id: true, title: true, difficulty: true },
        });

        if (problems.length < 3) {
            res.status(400).json({ error: "Not enough problems matching criteria (need at least 3)" });
            return;
        }

        // Shuffle and pick 3
        const selectedProblems = problems
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(p => ({ ...p, solved: false, submissionId: null }));

        const session = await db.interviewSession.create({
            data: {
                userId,
                duration,
                problems: selectedProblems,
                status: "IN_PROGRESS",
                startTime: new Date(),
            }
        });

        res.status(201).json({
            success: true,
            session
        });
    } catch (error) {
        console.error("Start Interview Error:", error);
        res.status(500).json({ error: "Failed to start interview session" });
    }
};

export const getInterviewSession = async (req: any, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const session = await db.interviewSession.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } }
            }
        });

        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error("Get Interview Session Error:", error);
        res.status(500).json({ error: "Failed to fetch session" });
    }
};

export const submitInterview = async (req: any, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const session = await db.interviewSession.findUnique({ where: { id } });

        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }

        if (session.status !== "IN_PROGRESS") {
            res.status(400).json({ error: "Session already finalized" });
            return;
        }

        // Check solve status for the problems from submissions
        const problems = session.problems as any[];
        let solvedCount = 0;

        // Total score calculation logic
        // Easy: 20 pts, Medium: 50 pts, Hard: 100 pts
        let score = 0;

        const updatedProblems = await Promise.all(problems.map(async (p) => {
            const submission = await db.submission.findFirst({
                where: {
                    userId: session.userId,
                    problemId: p.id,
                    status: "Accepted",
                    createdAt: {
                        gte: session.startTime
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (submission) {
                solvedCount++;
                const points = p.difficulty === "EASY" ? 20 : p.difficulty === "MEDIUM" ? 50 : 100;
                score += points;
                return { ...p, solved: true, submissionId: submission.id };
            }
            return p;
        }));

        // Generate Dynamic AI Feedback
        let feedback = {
            summary: `You solved ${solvedCount} out of 3 problems.`,
            strengths: solvedCount > 0 ? ["Good problem solving", "Technical accuracy"] : [],
            improvements: solvedCount < 3 ? ["Time management", "Edge case handling"] : ["Optimizing space complexity"],
            recommendation: solvedCount === 3 ? "Ready for top-tier interviews!" : "Practice more Medium level strings."
        };

        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    generationConfig: { responseMimeType: "application/json" }
                });

                const prompt = `
                    You are a senior technical interviewer at a top-tier tech company.
                    A candidate has just finished a mock interview session.
                    
                    Stats:
                    - Problems Attempted: 3
                    - Problems Solved: ${solvedCount}
                    - Final Score: ${score}
                    - Problem Details: ${JSON.stringify(updatedProblems)}
                    
                    Analyze their performance and provide structured feedback.
                    Be professional, constructive, and encouraging.
                    
                    Return a JSON object with this structure:
                    {
                        "summary": "One or two sentences summarizing their overall performance.",
                        "strengths": ["Strength 1", "Strength 2"],
                        "improvements": ["Area for improvement 1", "Area for improvement 2"],
                        "recommendation": "A specific next step or recommendation."
                    }
                `;

                const result = await model.generateContent(prompt);
                feedback = JSON.parse(result.response.text());
            } catch (err) {
                console.error("AI Feedback Generation Error:", err);
            }
        }

        const updatedSession = await db.interviewSession.update({
            where: { id },
            data: {
                problems: updatedProblems,
                status: "COMPLETED",
                endTime: new Date(),
                score,
                feedback: feedback as any
            }
        });

        res.json({
            success: true,
            session: updatedSession
        });
    } catch (error) {
        console.error("Submit Interview Error:", error);
        res.status(500).json({ error: "Failed to finalize interview session" });
    }
};

export const generateInterviewHint = async (req: any, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { problemId, currentCode } = req.body;

        const problem = await db.problem.findUnique({ where: { id: problemId } });
        if (!problem) {
            res.status(404).json({ error: "Problem not found" });
            return;
        }

        // Use Gemini to generate a hint
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a technical interviewer at a top tech company. 
            The candidate is solving the problem: "${problem.title}".
            Difficulty: ${problem.difficulty}.
            Description: ${problem.description}.
            
            Current candidate code:
            "${currentCode || "No code written yet."}"
            
            Based on their progress, provide a concise, helpful hint. 
            Do NOT provide the full solution. 
            Encourage them to think about complexity or edge cases.
            Keep the hint under 100 words and maintain a professional yet encouraging tone.
        `;

        const result = await model.generateContent(prompt);
        const hint = result.response.text();

        res.json({
            success: true,
            hint
        });
    } catch (error) {
        console.error("Generate Hint Error:", error);
        res.status(500).json({ error: "Failed to generate hint" });
    }
};
