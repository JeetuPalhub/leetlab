import { Request, Response } from 'express';
import { db } from '../libs/db.js';

const getParamAsString = (value: string | string[] | undefined): string | null => {
    return typeof value === 'string' && value.trim() ? value : null;
};

// LIKE A PROBLEM
export const likeProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const problemId = getParamAsString(req.params.problemId);
        if (!problemId) {
            res.status(400).json({ error: 'Invalid problem id' });
            return;
        }
        const userId = req.user.id;

        // Check if problem exists
        const problem = await db.problem.findUnique({ where: { id: problemId } });
        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        // Check if already liked
        const existingLike = await db.problemLike.findUnique({
            where: { userId_problemId: { userId, problemId } }
        });

        if (existingLike) {
            res.status(400).json({ error: 'Problem already liked' });
            return;
        }

        await db.problemLike.create({
            data: { userId, problemId }
        });

        const likeCount = await db.problemLike.count({ where: { problemId } });

        res.status(201).json({
            success: true,
            message: 'Problem liked',
            likeCount
        });
    } catch (error) {
        console.error('Like Problem Error:', error);
        res.status(500).json({ error: 'Failed to like problem' });
    }
};

// UNLIKE A PROBLEM
export const unlikeProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const problemId = getParamAsString(req.params.problemId);
        if (!problemId) {
            res.status(400).json({ error: 'Invalid problem id' });
            return;
        }
        const userId = req.user.id;

        const existingLike = await db.problemLike.findUnique({
            where: { userId_problemId: { userId, problemId } }
        });

        if (!existingLike) {
            res.status(400).json({ error: 'Problem not liked' });
            return;
        }

        await db.problemLike.delete({
            where: { userId_problemId: { userId, problemId } }
        });

        const likeCount = await db.problemLike.count({ where: { problemId } });

        res.status(200).json({
            success: true,
            message: 'Problem unliked',
            likeCount
        });
    } catch (error) {
        console.error('Unlike Problem Error:', error);
        res.status(500).json({ error: 'Failed to unlike problem' });
    }
};

// BOOKMARK A PROBLEM
export const bookmarkProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const problemId = getParamAsString(req.params.problemId);
        if (!problemId) {
            res.status(400).json({ error: 'Invalid problem id' });
            return;
        }
        const { note } = req.body;
        const userId = req.user.id;

        const problem = await db.problem.findUnique({ where: { id: problemId } });
        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        const existingBookmark = await db.problemBookmark.findUnique({
            where: { userId_problemId: { userId, problemId } }
        });

        if (existingBookmark) {
            // Update note if already bookmarked
            await db.problemBookmark.update({
                where: { userId_problemId: { userId, problemId } },
                data: { note }
            });
            res.status(200).json({ success: true, message: 'Bookmark updated' });
            return;
        }

        await db.problemBookmark.create({
            data: { userId, problemId, note }
        });

        res.status(201).json({
            success: true,
            message: 'Problem bookmarked for revision'
        });
    } catch (error) {
        console.error('Bookmark Problem Error:', error);
        res.status(500).json({ error: 'Failed to bookmark problem' });
    }
};

// REMOVE BOOKMARK
export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const problemId = getParamAsString(req.params.problemId);
        if (!problemId) {
            res.status(400).json({ error: 'Invalid problem id' });
            return;
        }
        const userId = req.user.id;

        const existingBookmark = await db.problemBookmark.findUnique({
            where: { userId_problemId: { userId, problemId } }
        });

        if (!existingBookmark) {
            res.status(400).json({ error: 'Problem not bookmarked' });
            return;
        }

        await db.problemBookmark.delete({
            where: { userId_problemId: { userId, problemId } }
        });

        res.status(200).json({
            success: true,
            message: 'Bookmark removed'
        });
    } catch (error) {
        console.error('Remove Bookmark Error:', error);
        res.status(500).json({ error: 'Failed to remove bookmark' });
    }
};

// GET USER BOOKMARKS
export const getUserBookmarks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const bookmarks = await db.problemBookmark.findMany({
            where: { userId: req.user.id },
            include: {
                problem: {
                    select: { id: true, title: true, difficulty: true, tags: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            bookmarks
        });
    } catch (error) {
        console.error('Get Bookmarks Error:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
};

// GET USER LIKES
export const getUserLikes = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const likes = await db.problemLike.findMany({
            where: { userId: req.user.id },
            include: {
                problem: {
                    select: { id: true, title: true, difficulty: true, tags: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            likes
        });
    } catch (error) {
        console.error('Get Likes Error:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
};

// GET PROBLEM INTERACTION STATUS (for UI)
export const getProblemInteractionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const problemId = getParamAsString(req.params.problemId);
        if (!problemId) {
            res.status(400).json({ error: 'Invalid problem id' });
            return;
        }
        const userId = req.user.id;

        const [isLiked, isBookmarked, likeCount] = await Promise.all([
            db.problemLike.findUnique({ where: { userId_problemId: { userId, problemId } } }),
            db.problemBookmark.findUnique({ where: { userId_problemId: { userId, problemId } } }),
            db.problemLike.count({ where: { problemId } })
        ]);

        res.status(200).json({
            success: true,
            isLiked: !!isLiked,
            isBookmarked: !!isBookmarked,
            bookmarkNote: isBookmarked?.note || null,
            likeCount
        });
    } catch (error) {
        console.error('Get Interaction Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch interaction status' });
    }
};
