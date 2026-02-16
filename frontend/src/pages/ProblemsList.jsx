import React, { useEffect } from "react";
import { useProblemStore } from "../store/useProblemStore";
import ProblemsTable from "../components/ProblemTable";
import { Loader, Search, Filter, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "../components/Skeleton";

const ProblemsList = () => {
    const { getAllProblems, problems, isProblemsLoading, pagination } = useProblemStore();
    const [search, setSearch] = React.useState("");
    const [difficulty, setDifficulty] = React.useState("ALL");
    const [selectedTag, setSelectedTag] = React.useState("ALL");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getAllProblems({ page: 1, search, difficulty, tags: selectedTag });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, difficulty, selectedTag, getAllProblems]);

    const handleLoadMore = () => {
        if (pagination?.hasMore) {
            getAllProblems({
                page: pagination.currentPage + 1,
                search,
                difficulty,
                tags: selectedTag
            }, true);
        }
    };

    if (isProblemsLoading && problems.length === 0) {
        return (
            <div className="min-h-screen bg-base-200/50 pb-20">
                <div className="bg-base-100 border-b border-base-300 pt-10 pb-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-10 w-64 mb-4" />
                            <Skeleton className="h-6 w-96" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-6 -mt-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-base-100 rounded-[2rem] shadow-2xl border border-base-300 overflow-hidden p-6 md:p-10">
                            <Skeleton className="h-4 w-48 mb-8" />
                            <div className="space-y-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200/50 pb-20">
            {/* Header Section */}
            <div className="bg-base-100 border-b border-base-300 pt-10 pb-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="font-bold tracking-wider uppercase text-xs">Problem Set</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Explore All <span className="text-primary">Challenges</span>
                        </h1>
                        <p className="text-xl text-base-content/60 max-w-2xl leading-relaxed">
                            Sharpen your skills with our curated collection of algorithms, data structures, and system design problems.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 -mt-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="bg-base-100 rounded-[2rem] shadow-2xl border border-base-300 overflow-hidden">
                        <div className="p-6 md:p-10">
                            <div className="flex items-center gap-2 mb-8 text-base-content/40">
                                <Layers className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-widest">{pagination.totalProblems} Problems Available</span>
                            </div>

                            <ProblemsTable
                                problems={problems}
                                search={search}
                                setSearch={setSearch}
                                difficulty={difficulty}
                                setDifficulty={setDifficulty}
                                selectedTag={selectedTag}
                                setSelectedTag={setSelectedTag}
                            />

                            {pagination.hasMore && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        className={`btn btn-primary btn-wide ${isProblemsLoading ? 'loading' : ''}`}
                                        onClick={handleLoadMore}
                                        disabled={isProblemsLoading}
                                    >
                                        {isProblemsLoading ? 'Loading...' : 'Load More Problems'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Pro Tip Section ... */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                        <h3 className="font-bold text-primary mb-2">Newbie?</h3>
                        <p className="text-sm text-base-content/70">Start with "Easy" problems to build confidence in core syntax and logic.</p>
                    </div>
                    <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-6">
                        <h3 className="font-bold text-secondary mb-2">Interviewing?</h3>
                        <p className="text-sm text-base-content/70">Focus on "Medium" tag-specific problems common in technical screens.</p>
                    </div>
                    <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6">
                        <h3 className="font-bold text-accent mb-2">Pro Mode</h3>
                        <p className="text-sm text-base-content/70">Tackle "Hard" problems to master complex data structures and optimization.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProblemsList;
