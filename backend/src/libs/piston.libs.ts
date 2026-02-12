import axios from 'axios';
import { PistonLanguageConfig, PistonExecutionResult } from '../types/index.js';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

const PISTON_LANGUAGES: Record<string, PistonLanguageConfig> = {
    c: { language: 'c', version: '10.2.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'cpp', version: '10.2.0' },
    go: { language: 'go', version: '1.16.2' },
    rust: { language: 'rust', version: '1.68.2' },
    typescript: { language: 'typescript', version: '5.0.3' },
};

const languageIdMap: Record<number, string> = {
    50: 'c',
    54: 'cpp',
    60: 'go',
    62: 'java',
    63: 'javascript',
    71: 'python',
    73: 'rust',
    74: 'typescript',
};

export function getPistonLanguage(languageId: number): string {
    return languageIdMap[languageId] || 'javascript';
}

const LANGUAGE_NAMES: Record<number, string> = {
    50: 'C',
    54: 'C++',
    60: 'Go',
    62: 'Java',
    63: 'JavaScript',
    71: 'Python',
    73: 'Rust',
    74: 'TypeScript',
};

export function getLanguageName(languageId: number): string {
    return LANGUAGE_NAMES[languageId] || 'Unknown';
}

const extensions: Record<string, string> = {
    c: 'c',
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    go: 'go',
    rust: 'rs',
    typescript: 'ts',
};

function getFileExtension(language: string): string {
    return extensions[language] || 'txt';
}

export async function executeWithPiston(
    sourceCode: string,
    languageId: number,
    stdin: string
): Promise<PistonExecutionResult> {
    const langKey = getPistonLanguage(languageId);
    const langConfig = PISTON_LANGUAGES[langKey] || PISTON_LANGUAGES.javascript;

    try {
        const response = await axios.post(`${PISTON_API_URL}/execute`, {
            language: langConfig.language,
            version: langConfig.version,
            files: [
                {
                    name: `main.${getFileExtension(langConfig.language)}`,
                    content: sourceCode,
                },
            ],
            stdin: stdin || '',
            args: [],
            compile_timeout: 10000,
            run_timeout: 5000,
            compile_memory_limit: -1,
            run_memory_limit: -1,
        });

        return {
            stdout: response.data.run?.stdout || '',
            stderr: response.data.run?.stderr || response.data.compile?.stderr || '',
            compile_output: response.data.compile?.output || null,
            status: {
                id: response.data.run?.code === 0 ? 3 : 11,
                description:
                    response.data.run?.code === 0
                        ? 'Accepted'
                        : response.data.run?.stderr
                            ? 'Runtime Error'
                            : 'Accepted',
            },
            time: response.data.run?.time || '0',
            memory: response.data.run?.memory || 0,
        };
    } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        console.error('Piston API error:', err.response?.data || err.message);
        return {
            stdout: '',
            stderr: err.response?.data?.message || err.message || 'Execution failed',
            compile_output: null,
            status: {
                id: 13,
                description: 'Internal Error',
            },
            time: '0',
            memory: 0,
        };
    }
}

export async function executeBatchWithPiston(
    sourceCode: string,
    languageId: number,
    stdinArray: string[]
): Promise<PistonExecutionResult[]> {
    const results: PistonExecutionResult[] = [];

    for (const stdin of stdinArray) {
        const result = await executeWithPiston(sourceCode, languageId, stdin);
        results.push(result);
        await sleep(250);
    }

    return results;
}

export const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const judge0LanguageMap: Record<string, number> = {
    C: 50,
    'C++': 54,
    CPP: 54,
    GO: 60,
    JAVA: 62,
    JAVASCRIPT: 63,
    JS: 63,
    PYTHON: 71,
    RUST: 73,
    TYPESCRIPT: 74,
    TS: 74,
};

export function getJudge0LanguageId(language: string): number | undefined {
    const normalized = String(language || '').trim().toUpperCase();
    return judge0LanguageMap[normalized];
}
