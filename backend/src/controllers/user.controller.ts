import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js';
import { UserRole } from '../generated/prisma/index.js';

// UPDATE PROFILE (name, email)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name, email } = req.body;
        const userId = req.user.id;

        // Check if email is taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await db.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: { id: true, name: true, email: true, role: true, image: true },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new passwords are required' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }

        // Get current user with password
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// UPDATE PROFILE IMAGE (accepts URL)
export const updateProfileImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { imageUrl } = req.body;
        const userId = req.user.id;

        if (!imageUrl) {
            res.status(400).json({ error: 'Image URL is required' });
            return;
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { image: imageUrl },
            select: { id: true, name: true, email: true, role: true, image: true },
        });

        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Update Profile Image Error:', error);
        res.status(500).json({ error: 'Failed to update profile image' });
    }
};

// CHANGE USER ROLE (Admin only)
export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Only admins can change roles
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Only admins can change user roles' });
            return;
        }

        const { userId, newRole } = req.body;

        if (!userId || !newRole) {
            res.status(400).json({ error: 'User ID and new role are required' });
            return;
        }

        if (!['USER', 'ADMIN'].includes(newRole)) {
            res.status(400).json({ error: 'Invalid role. Must be USER or ADMIN' });
            return;
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { role: newRole as UserRole },
            select: { id: true, name: true, email: true, role: true, image: true },
        });

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Change Role Error:', error);
        res.status(500).json({ error: 'Failed to change user role' });
    }
};

// GET ALL USERS (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Only admins can view all users' });
            return;
        }

        const users = await db.user.findMany({
            select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
