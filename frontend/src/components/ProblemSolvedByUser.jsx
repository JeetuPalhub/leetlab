import React, { useEffect, useState } from 'react';
import { useProblemStore } from '../store/useProblemStore';
import { Link } from 'react-router-dom';
import {
  Tag, ExternalLink, AlertTriangle, CheckCircle, Circle,
  LayoutGrid, List as ListIcon, Search, Target, CheckCircle2,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProblemSolvedByUser = ({ userId }) => {
  const { getSolvedProblemByUser, solvedProblems, isLoading } = useProblemStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getSolvedProblemByUser(userId);
  }, [getSolvedProblemByUser, userId]);

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'MEDIUM': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'HARD': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
    }
  };

  const filteredProblems = Array.isArray(solvedProblems) ? solvedProblems.filter(p => {
    if (!p) return false;
    const title = p.title || "Untitled Problem";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || p.difficulty === filter;
    return matchesSearch && matchesFilter;
  }) : [];

  if (isLoading && solvedProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <span className="loading loading-spinner text-blue-600"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search & Filter */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mastered challenges..."
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

      {filteredProblems.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
          <Target className="w-16 h-16 text-gray-100 mx-auto mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No challenges conquered in this sector</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProblems.map((problem) => {
            const config = getDifficultyConfig(problem.difficulty);
            return (
              <motion.div
                layout
                key={problem.id}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 hover:border-gray-900/10 hover:shadow-xl hover:shadow-gray-200 transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} border ${config.border}`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{problem.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase ${config.color}`}>{problem.difficulty}</span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Mastered</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/problem/${problem.id}`} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {problem.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProblemSolvedByUser;