import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js';
import { RegisterBody, LoginBody } from '../types/index.js';

// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body as RegisterBody;

    try {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER',
            },
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser?.image,
            },
        });
    } catch (error) {
        const err = error as Error;
        console.error('Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginBody;

    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user?.image,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// LOGOUT
export const logout = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        });

        res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Failed to log out' });
    }
};

// CHECK AUTH
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            message: 'User authenticated successfully',
            user: req.user,
        });
    } catch (error) {
        console.error('Auth Check Error:', error);
        res.status(500).json({ error: 'Failed to check authentication' });
    }
};

// GET SUBMISSIONS
export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const submissions = await db.submission.findMany({
            where: {
                userId: req.user.id,
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

// GET USER PLAYLISTS
export const getUserPlaylists = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const playLists = await db.playlist.findMany({
            where: {
                userId: req.user.id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Playlists fetched successfully',
            playLists,
        });
    } catch (error) {
        console.error('Fetch Playlists Error:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
};
