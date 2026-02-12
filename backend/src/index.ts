import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiLimiter, codeExecutionLimiter, aiLimiter } from './middlewares/rateLimiter.js';

import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problems.routes.js';
import executeCodeRoutes from './routes/executeCode.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import userRoutes from './routes/user.routes.js';
import interactionRoutes from './routes/interaction.routes.js';
import contestRoutes from './routes/contest.routes.js';
import aiRoutes from './routes/ai.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import commentRoutes from './routes/comment.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { initCronJobs } from './libs/cron.js';
import challengeRoutes from './routes/challenge.routes.js';


dotenv.config();

const app: Application = express();

// Middlewares
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Global Rate Limiting
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'leetlab-backend',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/execute-code', codeExecutionLimiter, executeCodeRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/playlist', playlistRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/contest', contestRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/challenges', challengeRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    initCronJobs();
});
