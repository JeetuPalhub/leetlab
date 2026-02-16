import { Request, Response } from 'express';
import { db } from '../libs/db.js';

export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Allow fetching for other users if ID is provided in query, default to self
        const queryUserId = req.query.userId as string;
        const userId = queryUserId || req.user.id;

        const [submissions, totalSubmissions] = await Promise.all([
            db.submission.findMany({
                where: {
                    userId: userId,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    problem: {
                        select: {
                            title: true,
                            difficulty: true,
                        },
                    },
                },
            }),
            db.submission.count({
                where: {
                    userId: userId,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Submissions fetched successfully',
            submissions,
            pagination: {
                totalSubmissions,
                totalPages: Math.ceil(totalSubmissions / limit),
                currentPage: page,
                limit,
                hasMore: (skip + limit) < totalSubmissions,
            },
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

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const userId = req.user.id;
        const problemId = req.params.problemId as string;

        const [submissions, totalSubmissions] = await Promise.all([
            db.submission.findMany({
                where: {
                    userId: userId,
                    problemId: problemId,
                },
                include: {
                    testCases: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.submission.count({
                where: {
                    userId: userId,
                    problemId: problemId,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Submissions fetched successfully',
            submissions,
            pagination: {
                totalSubmissions,
                totalPages: Math.ceil(totalSubmissions / limit),
                currentPage: page,
                limit,
                hasMore: (skip + limit) < totalSubmissions,
            },
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
