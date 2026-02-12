import { rateLimit } from 'express-rate-limit';

// General rate limiter for all API requests
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

// Stricter rate limiter for code execution to prevent abuse of the Piston API
export const codeExecutionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Task execution rate limit exceeded. Please wait a minute before submitting again.',
    },
});

// Rate limiter for AI-powered features
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 AI requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'AI usage limit reached for this hour. Please try again later.',
    },
});
