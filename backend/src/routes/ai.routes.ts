import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { generateAIRoadmap, getAIRoadmap } from '../controllers/ai.controller.js';

const router = express.Router();

router.get('/', authenticate, getAIRoadmap);
router.post('/generate', authenticate, generateAIRoadmap);

export default router;
