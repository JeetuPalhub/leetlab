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
} from "lucide-react";

const SubmissionsList = ({ submissions, isLoading }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Helper function to safely parse JSON strings
  const safeParse = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing data:", error);
      return [];
    }
  };

  // Helper function to calculate average memory usage
  const calculateAverageMemory = (memoryData) => {
    const memoryArray = safeParse(memoryData).map((m) =>
      parseFloat(m.split(" ")[0])
    );
    if (memoryArray.length === 0) return 0;
    return (
      memoryArray.reduce((acc, curr) => acc + curr, 0) / memoryArray.length
    );
  };

  // Helper function to calculate average runtime
  const calculateAverageTime = (timeData) => {
    const timeArray = safeParse(timeData).map((t) =>
      parseFloat(t.split(" ")[0])
    );
    if (timeArray.length === 0) return 0;
    return timeArray.reduce((acc, curr) => acc + curr, 0) / timeArray.length;
  };

  // Get language for Monaco editor
  const getMonacoLanguage = (lang) => {
    const langMap = {
      'javascript': 'javascript',
      'JAVASCRIPT': 'javascript',
      'python': 'python',
      'PYTHON': 'python',
      'java': 'java',
      'JAVA': 'java',
    };
    return langMap[lang] || 'plaintext';
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No submissions state
  if (!submissions?.length) {
    return (
      <div className="text-center p-8">
        <div className="text-base-content/70">No submissions yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const avgMemory = calculateAverageMemory(submission.memory);
        const avgTime = calculateAverageTime(submission.time);
        const isExpanded = expandedId === submission.id;

        return (
          <div
            key={submission.id}
            className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden"
          >
            <div
              className="card-body p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : submission.id)}
            >
              <div className="flex items-center justify-between">
                {/* Left Section: Status and Language */}
                <div className="flex items-center gap-4">
                  {submission.status === "Accepted" ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-semibold">Accepted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error">
                      <XCircle className="w-6 h-6" />
                      <span className="font-semibold">{submission.status}</span>
                    </div>
                  )}
                  <div className="badge badge-neutral">{submission.language}</div>
                </div>

                {/* Right Section: Runtime, Memory, Date, and Expand */}
                <div className="flex items-center gap-4 text-base-content/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{avgTime.toFixed(3)} s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Memory className="w-4 h-4" />
                    <span>{avgMemory.toFixed(0)} KB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="btn btn-ghost btn-sm btn-circle">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Code View */}
            {isExpanded && (
              <div className="border-t border-base-300">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Your Code</span>
                  </div>
                  <div className="h-[300px] w-full rounded-lg overflow-hidden border border-base-300">
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(submission.language)}
                      theme="vs-dark"
                      value={getSourceCode(submission.sourceCode)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionsList;