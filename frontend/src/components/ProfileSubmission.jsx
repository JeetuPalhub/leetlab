import React, { useEffect, useState } from 'react';
import { useSubmissionStore } from '../store/useSubmissionStore';
import Editor from '@monaco-editor/react';
import {
  Code2, Terminal, Clock, HardDrive, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Filter, Search, Calendar, Zap,
  ChevronRight, ArrowUpRight, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileSubmission = ({ userId }) => {
  const { submissions, getAllSubmissions, isLoading } = useSubmissionStore();
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllSubmissions(userId);
  }, [getAllSubmissions, userId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Accepted':
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
      case 'Wrong Answer':
        return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
      case 'Time Limit Exceeded':
        return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock };
      default:
        return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Zap };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter;
    const matchesSearch = submission.problem?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.language?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading && submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <span className="loading loading-spinner text-blue-600"></span>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter by problem or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-xs outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['all', 'Accepted', 'Wrong Answer'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${filter === type
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-900'
                  }`}
              >
                {type === 'all' ? 'Every Node' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[100px]">
            <div className="text-xs font-black text-gray-900">{submissions.length}</div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total Logs</div>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm text-center min-w-[100px]">
            <div className="text-xs font-black text-emerald-600">
              {submissions.filter(s => s.status === 'Accepted').length}
            </div>
            <div className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-0.5">Success</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Code2 className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No matching code fragments found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const config = getStatusConfig(submission.status);
            const isExpanded = expandedSubmission === submission.id;

            return (
              <motion.div
                layout
                key={submission.id}
                className={`bg-white rounded-[2rem] shadow-sm border transition-all duration-500 overflow-hidden ${isExpanded ? 'ring-4 ring-gray-900/5 border-gray-900/10' : 'border-gray-50'
                  }`}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                  onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} border ${config.border} shadow-sm`}>
                      <config.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-gray-900 text-lg">{submission.problem?.title || 'Unknown Problem'}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${submission.problem?.difficulty === 'EASY' ? 'text-emerald-500' : submission.problem?.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                          {submission.problem?.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Terminal className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{submission.language}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(submission.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${config.border} ${config.bg} ${config.color}`}>
                      {submission.status}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-gray-900 text-white rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-50"
                    >
                      <div className="p-8 space-y-8">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {[
                            { label: 'Latency', value: submission.time ? JSON.parse(submission.time)[0] : 'N/A', icon: Clock, color: 'text-blue-500' },
                            { label: 'Memory', value: submission.memory ? JSON.parse(submission.memory)[0] : 'N/A', icon: Cpu, color: 'text-purple-500' },
                            { label: 'Accuracy', value: submission.status === 'Accepted' ? '100%' : 'Fixed', icon: Target, color: 'text-emerald-500' }
                          ].map((stat, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-3xl flex items-center gap-4 border border-white">
                              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-black text-gray-900">{stat.value}</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Code Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                              <Code2 className="w-3 h-3 text-blue-500" /> Source Fragment
                            </h4>
                            <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                              Copy <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="h-[400px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group">
                            <Editor
                              height="100%"
                              language={submission.language?.toLowerCase() || 'javascript'}
                              theme="vs-dark"
                              value={typeof submission.sourceCode === 'string' ? (() => {
                                try {
                                  const p = JSON.parse(submission.sourceCode);
                                  return typeof p === 'string' ? p : JSON.stringify(p, null, 2);
                                } catch {
                                  return submission.sourceCode;
                                }
                              })() : JSON.stringify(submission.sourceCode, null, 2)}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: 'on',
                                padding: { top: 20 },
                                backgroundColor: '#0a0a0a'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProfileSubmission;