import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    updateProfile,
    changePassword,
    updateProfileImage,
    changeUserRole,
    getAllUsers,
    getUserProfileData,
} from '../controllers/user.controller.js';

const userRoutes = express.Router();

// Protected routes - require authentication
userRoutes.get('/profile-data', authenticate, getUserProfileData);
userRoutes.put('/profile', authenticate, updateProfile);
userRoutes.put('/password', authenticate, changePassword);
userRoutes.put('/image', authenticate, updateProfileImage);

// Admin only routes
userRoutes.put('/role', authenticate, changeUserRole);
userRoutes.get('/all', authenticate, getAllUsers);

export default userRoutes;
