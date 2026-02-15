import { Request, Response } from 'express';
import { db } from '../libs/db.js';

// CREATE A COMMENT
export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { problemId, content, parentId } = req.body;
        const userId = req.user.id;

        if (!content || content.trim() === '') {
            res.status(400).json({ error: 'Comment content is required' });
            return;
        }

        const comment = await db.comment.create({
            data: {
                content,
                userId,
                problemId,
                parentId: parentId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment,
        });
    } catch (error) {
        console.error('Create Comment Error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// GET COMMENTS FOR A PROBLEM
export const getCommentsByProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { problemId } = req.params;

        const comments = await db.comment.findMany({
            where: {
                problemId: problemId as string,
                parentId: null, // Get top-level comments first
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            comments,
        });
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

// DELETE A COMMENT
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const userId = req.user.id;

        const comment = await db.comment.findUnique({
            where: { id: id as string },
        });

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // Only author or admin can delete
        if (comment.userId !== userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await db.comment.delete({
            where: { id: id as string },
        });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
