import { Request, Response } from 'express';
import { db } from '../libs/db.js';
import {
    getJudge0LanguageId,
    pollBatchResults,
    submitBatch,
} from '../libs/problem.libs.js';
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
            // Step 2.1: Get Judge0 language ID for the current language
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                res.status(400).json({ error: `Unsupported language: ${language}` });
                return;
            }

            // Step 2.2: Prepare Judge0 submissions for all test cases
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            console.log('Submissions:', submissions);

            // Step 2.3: Submit all test cases in one batch
            const submissionResults = await submitBatch(submissions);

            // Step 2.4: Extract tokens from response
            const tokens = submissionResults.map((r) => r.token);

            // Step 2.5: Poll Judge0 until all submissions are done
            const results = await pollBatchResults(tokens);

            // Step 2.6: Validate that each test case passed (status.id === 3)
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    res.status(400).json({
                        error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
                        details: result,
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

        const problems = await db.problem.findMany({
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id,
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

            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((r) => r.token);
            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    res.status(400).json({
                        error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
                        details: result,
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
