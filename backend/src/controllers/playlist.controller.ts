import { Request, Response } from 'express';
import { db } from '../libs/db.js';
import { CreatePlaylistBody, AddProblemsToPlaylistBody } from '../types/index.js';

export const createPlayList = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name, description } = req.body as CreatePlaylistBody;
        const userId = req.user.id;

        const playList = await db.playlist.create({
            data: {
                name,
                description,
                userId,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Playlist created successfully',
            playList,
        });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
};

export const getPlayAllListDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const playLists = await db.playlist.findMany({
            where: {
                userId: req.user.id,
            },
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            message: 'Playlist fetched successfully',
            playLists,
        });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
};

export const getPlayListDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const playlistId = req.params.playlistId as string;

        const playList = await db.playlist.findUnique({
            where: { id: playlistId, userId: req.user.id },
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
            },
        });

        if (!playList) {
            res.status(404).json({ error: 'Playlist not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Playlist fetched successfully',
            playList,
        });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
};

export const addProblemToPlaylist = async (req: Request, res: Response): Promise<void> => {
    const playlistId = req.params.playlistId as string;
    const { problemIds } = req.body as AddProblemsToPlaylistBody;

    console.log(problemIds);
    try {
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            res.status(400).json({ error: 'Invalid or missing problemIds' });
            return;
        }
        const problemsInPlaylist = await db.problemInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playlistId,
                problemId,
            })),
            skipDuplicates: true,
        });

        res.status(201).json({
            success: true,
            message: 'Problems added to playlist successfully',
            problemsInPlaylist,
        });
    } catch (error) {
        const err = error as Error;
        console.error('Error adding problems to playlist:', err.message);
        res.status(500).json({ error: 'Failed to add problems to playlist' });
    }
};

export const deletePlayList = async (req: Request, res: Response): Promise<void> => {
    const playlistId = req.params.playlistId as string;

    try {
        const deletedPlaylist = await db.playlist.delete({
            where: {
                id: playlistId,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully',
            deletedPlaylist,
        });
    } catch (error) {
        const err = error as Error;
        console.error('Error deleting playlist:', err.message);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
};

export const removeProblemFromPlaylist = async (req: Request, res: Response): Promise<void> => {
    const playlistId = req.params.playlistId as string;
    const { problemIds } = req.body as AddProblemsToPlaylistBody;

    try {
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            res.status(400).json({ error: 'Invalid or missing problemIds' });
            return;
        }

        const deletedProblem = await db.problemInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds,
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Problem removed from playlist successfully',
            deletedProblem,
        });
    } catch (error) {
        const err = error as Error;
        console.error('Error removing problem from playlist:', err.message);
        res.status(500).json({ error: 'Failed to remove problem from playlist' });
    }
};
