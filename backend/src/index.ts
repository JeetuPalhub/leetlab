import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problems.routes.js';
import executeCodeRoutes from './routes/executeCode.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import userRoutes from './routes/user.routes.js';

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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/execute-code', executeCodeRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/playlist', playlistRoutes);
app.use('/api/v1/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
