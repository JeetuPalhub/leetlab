import { Request, Response } from 'express';
import { db } from '../libs/db.js';

export const getDailyChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challenge = await db.dailyChallenge.findUnique({
            where: { date: today },
        });

        if (!challenge) {
            res.status(404).json({ error: 'No challenge found for today.' });
            return;
        }

        const problem = await db.problem.findUnique({
            where: { id: challenge.problemId },
            select: {
                id: true,
                title: true,
                difficulty: true,
                tags: true,
                description: true
            }
        });

        res.status(200).json({
            success: true,
            challenge: {
                ...challenge,
                problem
            }
        });
    } catch (error) {
        console.error('Get Daily Challenge Error:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge' });
    }
};
