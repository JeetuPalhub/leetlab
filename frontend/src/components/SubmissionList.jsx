import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
  Calendar,
  ChevronDown,
  ChevronUp,
  Code,
  Activity,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";
import EmptyState from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { getMonacoLanguage } from "../libs/utils";

const SubmissionsList = ({ submissions, isLoading, pagination, onLoadMore }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Helper function to safely parse JSON strings
  const safeParse = (data) => {
    try {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing data:", error);
      return [];
    }
  };

  // Helper function to calculate average memory usage
  const calculateAverageMemory = (memoryData) => {
    const memoryArray = safeParse(memoryData).map((m) =>
      m && typeof m === 'string' ? parseFloat(m.split(" ")[0]) : m
    );
    if (memoryArray.length === 0) return 0;
    return (
      memoryArray.reduce((acc, curr) => acc + curr, 0) / memoryArray.length
    );
  };

  // Helper function to calculate average runtime
  const calculateAverageTime = (timeData) => {
    const timeArray = safeParse(timeData).map((t) =>
      t && typeof t === 'string' ? parseFloat(t.split(" ")[0]) : t
    );
    if (timeArray.length === 0) return 0;
    return timeArray.reduce((acc, curr) => acc + curr, 0) / timeArray.length;
  };


  // Get source code as string
  const getSourceCode = (sourceCode) => {
    if (typeof sourceCode === 'string') {
      try {
        const parsed = JSON.parse(sourceCode);
        return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      } catch {
        return sourceCode;
      }
    }
    return JSON.stringify(sourceCode, null, 2);
  };

  // Loading state (only for initial load)
  if (isLoading && !submissions?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retrieving submission history...</span>
      </div>
    );
  }

  // No submissions state
  if (!submissions?.length && !isLoading) {
    return (
      <div className="text-center p-20 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Activity className="w-10 h-10 text-gray-700" />
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No submissions recorded</p>
        <p className="text-xs text-gray-600 mt-2">Your journey to mastery starts with your first submit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 bg-[#1a1a1a]">
      {submissions.map((submission, index) => {
        const avgMemory = calculateAverageMemory(submission.memory);
        const avgTime = calculateAverageTime(submission.time);
        const isExpanded = expandedId === submission.id;
        const isAccepted = submission.status === "Accepted";

        return (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group rounded-[1.5rem] overflow-hidden border transition-all ${isExpanded
              ? "bg-[#252525] border-white/10 shadow-2xl"
              : "bg-[#1e1e1e] border-white/5 hover:border-white/10"
              }`}
          >
            <div
              className="p-6 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedId(isExpanded ? null : submission.id)}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAccepted ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  }`}>
                  {isAccepted ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-black text-sm uppercase tracking-wider ${isAccepted ? "text-emerald-500" : "text-red-500"}`}>
                      {submission.status}
                    </h4>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-gray-400 font-bold uppercase">{submission.language}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(submission.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {avgTime.toFixed(3)}s</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-gray-600 tracking-tighter">Memory</div>
                    <div className="text-xs font-bold text-gray-400">{avgMemory.toFixed(0)} KB</div>
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-all ${isExpanded ? "bg-white/10 text-white rotate-180" : "bg-white/5 text-gray-600 group-hover:text-gray-300"}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5 bg-[#1a1a1a]"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                        <Code className="w-4 h-4 text-blue-500" />
                        Solution Snapshot
                      </div>
                      <div className="text-[10px] text-gray-600 font-bold">STABLE VERSION</div>
                    </div>
                    <div className="h-[400px] w-full rounded-2xl overflow-hidden border-4 border-[#282828] shadow-inner bg-[#1e1e1e]">
                      <Editor
                        height="100%"
                        language={getMonacoLanguage(submission.language)}
                        theme="vs-dark"
                        value={getSourceCode(submission.sourceCode)}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          padding: { top: 20 },
                          fontFamily: "'Fira Code', 'Cascadia Code', monospace"
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Load More Button */}
      {pagination?.hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-8 rounded-xl transition-all ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                FETCHING LOGS...
              </>
            ) : (
              <>
                FETCH MORE ATTEMPTS <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;