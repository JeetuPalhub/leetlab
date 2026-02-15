import { Request, Response } from 'express';
import { db } from '../libs/db.js';

export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Allow fetching for other users if ID is provided in query, default to self
        const queryUserId = req.query.userId as string;
        const userId = queryUserId || req.user.id;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Submissions fetched successfully',
            submissions,
        });
    } catch (error) {
        console.error('Fetch Submissions Error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getSubmissionsForProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const problemId = req.params.problemId as string;
        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId,
            },
            include: {
                testCases: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            message: 'Submissions fetched successfully',
            submissions,
        });
    } catch (error) {
        console.error('Fetch Submissions Error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getAllTheSubmissionsForProblem = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const problemId = req.params.problemId as string;
        const submissions = await db.submission.count({
            where: {
                problemId: problemId,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Submissions fetched successfully',
            count: submissions,
        });
    } catch (error) {
        console.error('Fetch Submissions Error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const submission = await db.submission.findUnique({
            where: { id },
            include: {
                testCases: true,
                problem: {
                    select: {
                        title: true,
                        difficulty: true,
                    },
                },
            },
        });

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        res.status(200).json({
            success: true,
            submission,
        });
    } catch (error) {
        console.error('Fetch Submission Error:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};
