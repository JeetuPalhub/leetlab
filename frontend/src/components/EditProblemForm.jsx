"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus,
    Trash2,
    Code2,
    FileText,
    Lightbulb,
    BookOpen,
    CheckCircle2,
    Download,
    FlaskConical,
    Sparkles,
    Wand2,
    Save,
    ArrowLeft
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProblemStore } from "../store/useProblemStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const problemSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    constraints: z.string().min(1, "Constraints are required"),
    hints: z.string().optional().nullable(),
    editorial: z.string().optional().nullable(),
    testCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
            })
        )
        .min(1, "At least one test case is required"),
    examples: z.object({
        JAVASCRIPT: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional().nullable(),
        }),
        PYTHON: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional().nullable(),
        }),
        JAVA: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional().nullable(),
        }),
    }),
    codeSnippets: z.object({
        JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
        PYTHON: z.string().min(1, "Python code snippet is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),
    referenceSolutions: z.object({
        JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
        PYTHON: z.string().min(1, "Python solution is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),
});

const EditProblemForm = ({ initialData }) => {
    const navigate = useNavigate();
    const { updateProblem, isProblemLoading: isLoading } = useProblemStore();
    const [activeTab, setActiveTab] = useState("basics");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: initialData,
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "testCases",
    });

    const onSubmit = async (value) => {
        try {
            const success = await updateProblem(initialData.id, value);
            if (success) {
                navigate("/problems");
            }
        } catch (error) {
            console.log("Error updating problem", error);
        }
    };

    const tabs = [
        { id: "basics", label: "Basics", icon: FileText },
        { id: "details", label: "Description", icon: BookOpen },
        { id: "testcases", label: "Test Cases", icon: FlaskConical },
        { id: "snippets", label: "Code & Samples", icon: Code2 },
    ];

    const availableTags = ["Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "DFS", "Binary Search", "Two Pointers", "BFS", "Tree", "Matrix", "Backtracking", "Stack", "Design", "Graph", "Heap"];

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 cursor-pointer hover:translate-x-[-4px] transition-transform" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <span className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <FileText className="w-8 h-8" />
                            </span>
                            Edit <span className="text-blue-600">Problem</span>
                        </h1>
                        <p className="mt-2 text-gray-500 font-medium">Updating challenge: <span className="text-gray-900 font-bold">{initialData.title}</span></p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl transition-all font-bold text-sm uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-xl"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Body */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 flex-1">

                        {activeTab === "basics" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Problem Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-5 text-lg font-bold transition-all outline-none"
                                            {...register("title")}
                                            placeholder="e.g. Valid Anagram"
                                        />
                                        {errors.title && <p className="text-red-500 text-xs font-bold uppercase ml-2">{errors.title.message}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Difficulty Level</label>
                                        <select
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-5 text-lg font-bold transition-all outline-none appearance-none cursor-pointer"
                                            {...register("difficulty")}
                                        >
                                            <option value="EASY">🟢 Easy</option>
                                            <option value="MEDIUM">🟡 Medium</option>
                                            <option value="HARD">🔴 Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Topic Tags</label>
                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                                {availableTags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            const newValue = Array.isArray(field.value)
                                                                ? (field.value.includes(tag) ? field.value.filter(t => t !== tag) : [...field.value, tag])
                                                                : [tag];
                                                            field.onChange(newValue);
                                                        }}
                                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${Array.isArray(field.value) && field.value.includes(tag)
                                                                ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                                                                : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    />
                                    {errors.tags && <p className="text-red-500 text-xs font-bold uppercase ml-2">{errors.tags.message}</p>}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "details" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Problem Description (supports Markdown)</label>
                                    <textarea
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl px-8 py-8 min-h-[300px] text-lg leading-relaxed transition-all outline-none resize-none"
                                        {...register("description")}
                                        placeholder="Provide a clear and concise problem statement..."
                                    />
                                    {errors.description && <p className="text-red-500 text-xs font-bold uppercase ml-2">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Constraints</label>
                                        <textarea
                                            className="w-full bg-gray-900 text-blue-300 font-mono rounded-2xl px-6 py-6 min-h-[160px] outline-none border-4 border-gray-800 focus:border-blue-500 transition-all"
                                            {...register("constraints")}
                                            placeholder="e.g. 1 <= n <= 1000"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Implementation Hints</label>
                                        <textarea
                                            className="w-full bg-amber-50 text-amber-900 border-2 border-amber-100 rounded-2xl px-6 py-6 min-h-[160px] outline-none focus:border-amber-400 transition-all"
                                            {...register("hints")}
                                            placeholder="Give users a nudge in the right direction..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "testcases" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                                    <h3 className="text-lg font-black uppercase text-gray-400 tracking-tighter">Validation Test Suite</h3>
                                    <button
                                        type="button"
                                        onClick={() => append({ input: "", output: "" })}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
                                    >
                                        <Plus className="w-5 h-5" /> Add Case
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="group relative bg-gray-50 p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Input Data</span>
                                                    <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 font-mono text-sm min-h-[120px] outline-none focus:border-blue-400 transition-all" {...register(`testCases.${index}.input`)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Expected Output</span>
                                                    <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 font-mono text-sm min-h-[120px] outline-none focus:border-blue-400 transition-all" {...register(`testCases.${index}.output`)} />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "snippets" && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
                                {["JAVASCRIPT", "PYTHON", "JAVA"].map((language) => (
                                    <div key={language} className="space-y-8 bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-900 rounded-2xl text-white">
                                                <Code2 className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-black">{language} Configurations</h3>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase text-gray-400 ml-2">Starter Code</h4>
                                                <div className="rounded-[1.5rem] overflow-hidden bg-[#1e1e1e] border-8 border-[#333] h-[350px] shadow-2xl">
                                                    <Controller
                                                        name={`codeSnippets.${language}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Editor
                                                                height="100%"
                                                                language={language.toLowerCase()}
                                                                theme="vs-dark"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, padding: { top: 20 } }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase text-gray-400 ml-2">Reference Solution</h4>
                                                <div className="rounded-[1.5rem] overflow-hidden bg-[#1e1e1e] border-8 border-[#333] h-[350px] shadow-2xl">
                                                    <Controller
                                                        name={`referenceSolutions.${language}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Editor
                                                                height="100%"
                                                                language={language.toLowerCase()}
                                                                theme="vs-dark"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, padding: { top: 20 } }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-gray-200 space-y-6">
                                            <h4 className="text-xs font-black uppercase text-gray-400 ml-2">UI Display Example</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-4">INPUT</label>
                                                    <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-mono text-sm h-32 outline-none focus:border-blue-400 transition-all" {...register(`examples.${language}.input`)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-4">OUTPUT</label>
                                                    <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-mono text-sm h-32 outline-none focus:border-blue-400 transition-all" {...register(`examples.${language}.output`)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-4">EXPLANATION</label>
                                                    <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm h-32 outline-none focus:border-blue-400 transition-all" {...register(`examples.${language}.explanation`)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* Bottom Push Navigation */}
                        <div className="mt-16 pt-12 border-t border-gray-100 flex items-center justify-between gap-8">
                            <div className="flex-1 flex items-center gap-6 text-gray-300">
                                <div className="h-0.5 flex-1 bg-gray-100"></div>
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">Enterprise Validator</span>
                                <div className="h-0.5 flex-1 bg-gray-100"></div>
                            </div>

                            <button
                                type="submit"
                                className="relative bg-blue-600 hover:bg-blue-700 text-white h-24 px-16 rounded-[2rem] font-black text-2xl flex items-center gap-4 transition-all hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-lg"></span>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Save Changes</span>
                                        <Save className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProblemForm;
