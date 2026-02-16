import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Info, Sparkles } from 'lucide-react';
import { useContestStore } from '../store/useContestStore';
import ContestCard from '../components/ContestCard';

const ContestList = () => {
    const { contests, fetchContests, loading, pagination } = useContestStore();

    useEffect(() => {
        fetchContests();
    }, []);

    const handleLoadMore = () => {
        if (pagination?.hasMore) {
            fetchContests(pagination.currentPage + 1, pagination.limit, true);
        }
    }

    const liveContests = contests.filter(c => new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime));
    const upcomingContests = contests.filter(c => new Date() < new Date(c.startTime));
    const finishedContests = contests.filter(c => new Date() > new Date(c.endTime));

    return (
        <div className="min-h-screen relative overflow-hidden pb-12">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Competitive Programming</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        LeetLab <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Contests</span>
                    </h1>
                    <p className="text-base-content/60 max-w-2xl mx-auto">
                        Challenge yourself with timed rounds, solve unique problems, and climb the global leaderboard.
                    </p>
                </motion.div>

                {/* Live Contests */}
                {liveContests.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-success/20 text-success">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold">Active Contests</h2>
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveContests.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Contests */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold">Upcoming Challenges</h2>
                    </div>
                    {upcomingContests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingContests.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                        </div>
                    ) : !loading && liveContests.length === 0 && upcomingContests.length === 0 && finishedContests.length === 0 ? (
                        <div className="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                            <Info className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                            <p className="text-base-content/50">No contests scheduled yet. Check back soon!</p>
                        </div>
                    ) : null}
                </section>

                {/* Finished Contests */}
                {finishedContests.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-base-200 text-base-content/40">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-base-content/50">Past Contests</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {finishedContests.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                        </div>
                    </section>
                )}

                {loading && (
                    <div className="flex justify-center py-10">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}

                {/* Load More Button */}
                {pagination.hasMore && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className={`btn btn-primary btn-wide shadow-lg ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Fetching more arenas...' : 'Discover More Contests'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestList;
