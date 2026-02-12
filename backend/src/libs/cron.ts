import cron from 'node-cron';
import { db } from './db.js';

export const initCronJobs = () => {
    // Schedule a task to run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Daily Challenge Cron Job...');
        try {
            // 1. Get all problems
            const problems = await db.problem.findMany({
                select: { id: true }
            });

            if (problems.length === 0) {
                console.log('No problems found to set as daily challenge.');
                return;
            }

            // 2. Pick a random problem
            const randomIndex = Math.floor(Math.random() * problems.length);
            const selectedProblemId = problems[randomIndex].id;

            // 3. Save as today's challenge
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await db.dailyChallenge.upsert({
                where: { date: today },
                update: { problemId: selectedProblemId },
                create: {
                    date: today,
                    problemId: selectedProblemId,
                    points: 10 // Base points for daily challenge
                }
            });

            console.log(`Daily challenge set to problem ID: ${selectedProblemId}`);
        } catch (error) {
            console.error('Daily Challenge Cron Error:', error);
        }
    });

    // Run once on startup if no challenge exists for today
    (async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await db.dailyChallenge.findUnique({ where: { date: today } });
        if (!existing) {
            console.log('No daily challenge for today, generating one...');
            const problems = await db.problem.findMany({ select: { id: true } });
            if (problems.length > 0) {
                const selectedProblemId = problems[Math.floor(Math.random() * problems.length)].id;
                await db.dailyChallenge.create({
                    data: { date: today, problemId: selectedProblemId }
                });
            }
        }
    })();
};
