import React, { useEffect } from "react";
import { useLeaderboardStore } from "../store/useLeaderboardStore";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { Link } from "react-router-dom";

const LeaderboardPage = () => {
    const { leaderboard, myRank, getLeaderboard, getMyRank, isLoading, pagination } = useLeaderboardStore();

    useEffect(() => {
        getLeaderboard();
        getMyRank();
    }, []);

    const handleLoadMore = () => {
        if (pagination.hasMore) {
            getLeaderboard(pagination.currentPage + 1, pagination.limit, true);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2: return <Medal className="w-5 h-5 text-slate-400" />;
            case 3: return <Medal className="w-5 h-5 text-amber-700" />;
            default: return <span className="text-sm font-medium text-base-content/50">#{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden pb-12">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-2.5 bg-primary/10 rounded-xl mb-4">
                        <Award className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Global <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Leaderboard</span>
                    </h1>
                    <p className="text-base-content/60 max-w-lg mx-auto">
                        Compete with the best developers worldwide. Solve problems and climb the ranks!
                    </p>
                </div>

                {/* My Rank Card */}
                {myRank && (
                    <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Star className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-primary-content/60 text-xs font-medium uppercase tracking-wider mb-1">Your Standing</p>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    Ranked <span className="bg-white/20 px-3 py-1 rounded-lg">#{myRank.rank}</span>
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-primary-content/60 text-xs font-medium uppercase tracking-wider mb-1">Total Points</p>
                                <p className="text-3xl font-bold">{myRank.points} <span className="text-sm opacity-70">pts</span></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table Container */}
                <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/50">
                                    <th className="font-semibold">Rank</th>
                                    <th className="font-semibold">Developer</th>
                                    <th className="font-semibold px-2">Success</th>
                                    <th className="font-semibold">Points</th>
                                    <th className="font-semibold">Solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`hover:bg-base-200/5 transition-colors border-b border-base-200 last:border-0 ${user.id === myRank?.id ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="font-medium text-center w-16">{getRankIcon(user.rank)}</td>
                                        <td>
                                            <Link to={`/profile/${user.id}`} className="flex items-center gap-3 py-1">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-base-300 ring-2 ring-base-200">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-base-content/40 font-bold bg-base-300">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{user.name}</p>
                                                    <p className="text-[10px] text-base-content/40 font-mono">@{user.name?.toLowerCase().replace(/\s/g, '_')}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-2">
                                            <div className="flex items-center gap-2 min-w-[100px]">
                                                <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-success rounded-full"
                                                        style={{ width: `${user.successRate || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-base-content/50 w-8">{user.successRate || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-bold text-primary">{user.points}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm font-medium text-base-content/70">{user.problemsSolved}</span>
                                        </td>
                                    </tr>
                                ))}
                                {isLoading && (
                                    Array(pagination.currentPage === 1 ? 10 : 3).fill(0).map((_, i) => (
                                        <tr key={`skeleton-${i}`} className="animate-pulse">
                                            <td className="text-center w-16"><div className="h-4 w-4 bg-base-300 rounded mx-auto"></div></td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-base-300 rounded-xl"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-3 w-24 bg-base-300 rounded"></div>
                                                        <div className="h-2 w-16 bg-base-300 rounded opacity-50"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><div className="h-2 w-20 bg-base-300 rounded-full"></div></td>
                                            <td><div className="h-4 w-12 bg-base-300 rounded"></div></td>
                                            <td><div className="h-4 w-8 bg-base-300 rounded"></div></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && leaderboard.length === 0 && (
                        <div className="text-center py-20 bg-base-100/50">
                            <Trophy className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
                            <p className="text-lg font-medium text-base-content/30 italic">No rankings yet. Start solving to claim your spot!</p>
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                {pagination.hasMore && (
                    <div className="mt-10 flex justify-center">
                        <button
                            className={`btn btn-primary btn-wide shadow-lg group ${isLoading ? 'loading' : ''}`}
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading Legend...' : 'View More Champions'}
                            {!isLoading && <Award className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />}
                        </button>
                    </div>
                )}

                {leaderboard.length > 0 && !pagination.hasMore && !isLoading && (
                    <div className="mt-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-200/50 rounded-full text-xs font-bold text-base-content/30 border border-base-200">
                            <Award className="w-3 h-3" />
                            YOU'VE REACHED THE END OF THE HALL OF FAME
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
