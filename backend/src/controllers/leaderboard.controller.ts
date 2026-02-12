import { Request, Response } from 'express';
import { db } from '../libs/db.js';

type LeaderboardEntry = {
    rank: number;
    id: string;
    name: string | null;
    image: string | null;
    points: number;
    problemsSolved: number;
    submissionCount: number;
    successRate: number;
};

const buildLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            _count: {
                select: {
                    solvedProblems: true,
                    submissions: true,
                },
            },
        },
    });

    const rows = users
        .map((user) => {
            const problemsSolved = user._count.solvedProblems;
            const submissionCount = user._count.submissions;
            const points = problemsSolved * 100;
            const successRate =
                submissionCount > 0
                    ? Math.round((problemsSolved / submissionCount) * 100)
                    : 0;

            return {
                id: user.id,
                name: user.name,
                image: user.image,
                points,
                problemsSolved,
                submissionCount,
                successRate,
            };
        })
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
            return a.submissionCount - b.submissionCount;
        })
        .map((user, index) => ({
            rank: index + 1,
            ...user,
        }));

    return rows;
};

// GET TOP USERS BY COMPUTED POINTS
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaderboard = await buildLeaderboard();

        res.status(200).json({
            success: true,
            leaderboard: leaderboard.slice(0, 50),
        });
    } catch (error) {
        console.error('Get Leaderboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

// GET CURRENT USER RANK
export const getMyRank = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const leaderboard = await buildLeaderboard();
        const me = leaderboard.find((entry) => entry.id === userId);
        if (!me) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            id: me.id,
            rank: me.rank,
            points: me.points,
            problemsSolved: me.problemsSolved,
            successRate: me.successRate,
        });
    } catch (error) {
        console.error('Get My Rank Error:', error);
        res.status(500).json({ error: 'Failed to fetch ranking' });
    }
};
