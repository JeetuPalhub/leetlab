import { Request, Response } from 'express';
import { db } from '../libs/db.js';

const getParamAsString = (value: string | string[] | undefined): string | null => {
    return typeof value === 'string' && value.trim() ? value : null;
};

export const createContest = async (req: Request, res: Response) => {
    try {
        const { title, description, startTime, endTime, problems } = req.body;

        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!title || !startTime || !endTime || !Array.isArray(problems) || problems.length === 0) {
            res.status(400).json({ error: 'Missing required contest fields' });
            return;
        }

        const uniqueProblemIds = Array.from(new Set(problems.map((p: any) => p.problemId)));
        const existingProblems = await db.problem.findMany({
            where: { id: { in: uniqueProblemIds } },
            select: { id: true },
        });
        if (existingProblems.length !== uniqueProblemIds.length) {
            res.status(400).json({ error: 'One or more problem ids are invalid' });
            return;
        }

        const contest = await db.contest.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                createdById: req.user.id,
                problems: {
                    create: problems.map((p: any, index: number) => ({
                        problemId: p.problemId,
                        points: p.points || 100,
                        order: index
                    }))
                }
            },
            include: {
                problems: true
            }
        });

        res.json(contest);
    } catch (error) {
        console.error('Create Contest Error:', error);
        res.status(500).json({ error: 'Failed to create contest' });
    }
};

export const getContests = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [contests, totalContests] = await Promise.all([
            db.contest.findMany({
                include: {
                    _count: {
                        select: {
                            problems: true,
                            registrations: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    startTime: 'desc'
                }
            }),
            db.contest.count(),
        ]);

        res.json({
            success: true,
            contests,
            pagination: {
                totalContests,
                totalPages: Math.ceil(totalContests / limit),
                currentPage: page,
                limit,
                hasMore: (skip + limit) < totalContests,
            },
        });
    } catch (error) {
        console.error('Get Contests Error:', error);
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
};

export const getContestById = async (req: Request, res: Response) => {
    try {
        const id = getParamAsString(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid contest id' });
            return;
        }

        const contest = await db.contest.findUnique({
            where: { id },
            include: {
                problems: {
                    include: {
                        problem: {
                            select: {
                                id: true,
                                title: true,
                                difficulty: true,
                                tags: true
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            }
        });

        if (!contest) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }

        // Check if user is registered
        let isRegistered = false;
        if (req.user) {
            const registration = await db.contestRegistration.findUnique({
                where: {
                    userId_contestId: {
                        userId: req.user.id,
                        contestId: id
                    }
                }
            });
            isRegistered = !!registration;
        }

        res.json({ ...contest, isRegistered });
    } catch (error) {
        console.error('Get Contest Error:', error);
        res.status(500).json({ error: 'Failed to fetch contest details' });
    }
};

export const registerForContest = async (req: Request, res: Response) => {
    try {
        const id = getParamAsString(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid contest id' });
            return;
        }
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const contest = await db.contest.findUnique({ where: { id } });
        if (!contest) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }

        if (new Date() > new Date(contest.endTime)) {
            res.status(400).json({ error: 'Contest has already ended' });
            return;
        }

        const registration = await db.contestRegistration.upsert({
            where: {
                userId_contestId: {
                    userId,
                    contestId: id
                }
            },
            create: {
                userId,
                contestId: id
            },
            update: {}
        });

        res.json({ success: true, registration });
    } catch (error) {
        console.error('Register Contest Error:', error);
        res.status(500).json({ error: 'Failed to register for contest' });
    }
};

export const getContestLeaderboard = async (req: Request, res: Response) => {
    try {
        const id = getParamAsString(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid contest id' });
            return;
        }
        const contest = await db.contest.findUnique({
            where: { id },
            include: {
                problems: true,
                registrations: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true },
                        },
                    },
                },
            },
        });

        if (!contest) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }

        const problemIds = contest.problems.map((p) => p.problemId);
        const registeredUserIds = contest.registrations.map((r) => r.userId);

        if (problemIds.length === 0 || registeredUserIds.length === 0) {
            res.json([]);
            return;
        }

        const submissions = await db.submission.findMany({
            where: {
                status: 'Accepted',
                problemId: { in: problemIds },
                userId: { in: registeredUserIds },
                createdAt: {
                    gte: contest.startTime,
                    lte: contest.endTime,
                },
            },
            select: {
                userId: true,
                problemId: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        const problemPoints = contest.problems.reduce<Record<string, number>>((acc, cp) => {
            acc[cp.problemId] = cp.points;
            return acc;
        }, {});

        const leaderboardMap = new Map<string, {
            user: { id: string; name: string | null; image: string | null };
            totalScore: number;
            solvedProblems: Set<string>;
            lastSubmissionTime: Date;
        }>();

        contest.registrations.forEach((registration) => {
            leaderboardMap.set(registration.userId, {
                user: registration.user,
                totalScore: 0,
                solvedProblems: new Set<string>(),
                lastSubmissionTime: contest.endTime,
            });
        });

        submissions.forEach((sub) => {
            const entry = leaderboardMap.get(sub.userId);
            if (!entry) return;

            if (!entry.solvedProblems.has(sub.problemId)) {
                entry.solvedProblems.add(sub.problemId);
                entry.totalScore += problemPoints[sub.problemId] || 0;
                entry.lastSubmissionTime = sub.createdAt;
            }
        });

        const leaderboard = Array.from(leaderboardMap.values())
            .map((entry) => ({
                ...entry,
                solvedCount: entry.solvedProblems.size,
                solvedProblems: Array.from(entry.solvedProblems),
            }))
            .sort((a, b) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                return new Date(a.lastSubmissionTime).getTime() - new Date(b.lastSubmissionTime).getTime();
            });

        res.json(leaderboard);
    } catch (error) {
        console.error('Contest Leaderboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
