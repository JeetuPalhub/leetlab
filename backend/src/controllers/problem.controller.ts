import { Request, Response } from 'express';
import { db } from '../libs/db.js';
import {
    executeBatchWithJudge0,
    getJudge0LanguageId,
} from '../libs/judge0.libs.js';
import { CreateProblemBody, UpdateProblemBody } from '../types/index.js';

// Final Create Problem Handler
export const createProblem = async (req: Request, res: Response): Promise<void> => {
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
    } = req.body as CreateProblemBody;

    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // Step 1: Check if the requesting user is an admin
    if (req.user.role !== 'ADMIN') {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        // Step 2: Loop through each reference solution for different languages
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            // Step 2.1: Get Judge0 language ID (reused for Piston as they share IDs often or use mapping)
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                res.status(400).json({ error: `Unsupported language: ${language}` });
                return;
            }

            // Step 2.2: Prepare inputs for Piston
            const inputs = testCases.map((tc) => tc.input);

            // Step 2.3: Execute all test cases using Piston
            const results = await executeBatchWithJudge0(solutionCode, languageId, inputs);

            // Step 2.4: Validate results
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const expectedOutput = testCases[i].output.trim();
                const actualOutput = (result.stdout || '').trim();

                if (actualOutput !== expectedOutput) {
                    res.status(400).json({
                        error: `Validation failed for ${language} on test case ${i + 1}`,
                        details: {
                            input: inputs[i],
                            expected: expectedOutput,
                            actual: actualOutput,
                            error: result.stderr || ''
                        },
                    });
                    return;
                }

                // Also check for execution errors (non-zero exit code)
                if (result.status.id !== 3) {
                    res.status(400).json({
                        error: `Runtime error for ${language} on test case ${i + 1}`,
                        details: {
                            input: inputs[i],
                            error: result.stderr || result.status.description
                        }
                    });
                    return;
                }
            }
        }

        // Step 3: Save the problem in the database after all validations pass
        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples: examples as any,
                constraints,
                testCases: testCases as any,
                codeSnippets: codeSnippets as any,
                referenceSolutions: referenceSolutions as any,
                userId: req.user.id,
            },
        });

        // Step 4: Return success response with newly created problem
        res.status(201).json({
            success: true,
            message: 'Problem created successfully',
            problem: newProblem,
        });
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ error: 'Failed to create problem' });
    }
};

export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, difficulty, tags } = req.query;

        const where: any = {};

        if (search) {
            where.title = {
                contains: search as string,
                mode: 'insensitive',
            };
        }

        if (difficulty && difficulty !== 'ALL') {
            where.difficulty = difficulty;
        }

        if (tags && tags !== 'ALL') {
            // Assuming tags is a comma-separated string or just one tag
            const tagsArray = (tags as string).split(',');
            where.tags = {
                hasEvery: tagsArray,
            };
        }

        const [problems, totalProblems] = await Promise.all([
            db.problem.findMany({
                where,
                skip,
                take: limit,
                include: {
                    solvedBy: {
                        where: {
                            userId: req.user.id,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.problem.count({ where }),
        ]);

        const totalPages = Math.ceil(totalProblems / limit);

        res.status(200).json({
            success: true,
            message: 'Problems fetched successfully',
            problems,
            pagination: {
                totalProblems,
                totalPages,
                currentPage: page,
                limit,
                hasMore: page < totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    try {
        const problem = await db.problem.findUnique({ where: { id } });
        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Problem fetched successfully',
            problem,
        });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const id = req.params.id as string;

        const {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testCases,
            codeSnippets,
            referenceSolutions,
        } = req.body as UpdateProblemBody;

        const problem = await db.problem.findUnique({ where: { id } });

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        if (req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Forbidden: Only admin can update problems' });
            return;
        }

        // Step 1: Validate each reference solution using testCases
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                res.status(400).json({ error: `Unsupported language: ${language}` });
                return;
            }

            // Prepare inputs for Piston
            const inputs = testCases.map((tc) => tc.input);

            // Execute all test cases using Piston
            const results = await executeBatchWithJudge0(solutionCode, languageId, inputs);

            // Validate results
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const expectedOutput = testCases[i].output.trim();
                const actualOutput = (result.stdout || '').trim();

                if (actualOutput !== expectedOutput) {
                    res.status(400).json({
                        error: `Validation failed for ${language} on test case ${i + 1}`,
                        details: {
                            input: inputs[i],
                            expected: expectedOutput,
                            actual: actualOutput,
                            error: result.stderr || ''
                        },
                    });
                    return;
                }
            }
        }

        const updatedProblem = await db.problem.update({
            where: { id },
            data: {
                title,
                description,
                difficulty,
                tags,
                examples: examples as any,
                constraints,
                testCases: testCases as any,
                codeSnippets: codeSnippets as any,
                referenceSolutions: referenceSolutions as any,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Problem updated successfully',
            problem: updatedProblem,
        });
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ error: 'Failed to update problem' });
    }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const problem = await db.problem.findUnique({ where: { id } });

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Forbidden: Only admin can delete problems' });
            return;
        }

        await db.problem.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: 'Problem deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting problem:', error);
        res.status(500).json({ error: 'Failed to delete problem' });
    }
};

export const getAllProblemsSolvedByUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Allow fetching for other users if ID is provided in query, default to self
        const queryUserId = req.query.userId as string;
        const userId = queryUserId || req.user.id;

        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                solvedBy: {
                    where: {
                        userId: userId,
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            message: 'Problems fetched successfully',
            problems,
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};
