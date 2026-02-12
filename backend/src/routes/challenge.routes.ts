import { Router } from 'express';
import { getDailyChallenge } from '../controllers/challenge.controller.js';

const router = Router();

router.get('/today', getDailyChallenge);

export default router;
