import React, { useEffect, useState } from 'react';
import { useInteractionStore } from '../store/useInteractionStore';
import { Link } from 'react-router-dom';
import {
    Bookmark, ExternalLink, Trash2, Search, Target,
    CheckCircle2, ChevronRight, ArrowUpRight, StickyNote,
    Filter, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookmarkedProblems = () => {
    const { userBookmarks, getUserBookmarks, removeBookmark, isLoading } = useInteractionStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        getUserBookmarks();
    }, [getUserBookmarks]);

    const getDifficultyConfig = (difficulty) => {
        switch (difficulty) {
            case 'EASY': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case 'MEDIUM': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
            case 'HARD': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    const filteredBookmarks = userBookmarks.filter(b => {
        const matchesSearch = b.problem?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || b.problem?.difficulty === filter;
        return matchesSearch && matchesFilter;
    });

    if (isLoading && userBookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <span className="loading loading-spinner text-blue-600"></span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search revision notes..."
                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-xs outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
                    {['all', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
                        <button
                            key={diff}
                            onClick={() => setFilter(diff)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${filter === diff ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookmarks.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <Bookmark className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No revision vectors established</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredBookmarks.map((bookmark) => {
                        const config = getDifficultyConfig(bookmark.problem?.difficulty);
                        return (
                            <motion.div
                                layout
                                key={bookmark.id}
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-between hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                                                <Bookmark className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-lg leading-tight">{bookmark.problem?.title}</h4>
                                                <span className={`text-[10px] font-black uppercase ${config.color}`}>{bookmark.problem?.difficulty}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => removeBookmark(bookmark.problem?.id)} className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {bookmark.note && (
                                        <div className="bg-gray-50 p-4 rounded-2xl flex gap-3 items-start border border-gray-100">
                                            <StickyNote className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
                                                "{bookmark.note}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Archived</span>
                                        <span className="text-[9px] font-bold text-gray-300">{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Link
                                        to={`/problem/${bookmark.problem?.id}`}
                                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 group-hover:shadow-blue-200"
                                    >
                                        Initialize <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookmarkedProblems;
