import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  FileText,
  MessageSquare,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
  ChevronRight,
  BookOpen,
  Terminal,
  Code2,
  Users,
  ThumbsUp,
  Heart,
  HeartOff,
  Home,
  Wand2,
  Plus,
  Trash2,
  Sparkles,
  Bot,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId, getMonacoLanguage } from "../libs/utils";
import { useExecutionStore } from "../store/useExecution";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { useInteractionStore } from "../store/useInteractionStore";
import { useAIStore } from "../store/useAIStore";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";
import Discussion from "../components/Discussion";

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const { submission: submissions, isLoading: isSubmissionsLoading, getSubmissionForProblem, getSubmissionCountForProblem, submissionCount } = useSubmissionStore();
  const { interactionStatus, getInteractionStatus, likeProblem, unlikeProblem, bookmarkProblem, removeBookmark } = useInteractionStore();
  const { hint, suggestion, isLoadingHint, isLoadingSuggestion, getHint, getSuggestion, clearAI } = useAIStore();
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [testCases, setTestCases] = useState([]);
  const [customTestCases, setCustomTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [showCustomTests, setShowCustomTests] = useState(false);
  const editorRef = useRef(null);
  const resultRef = useRef(null);

  const { executeCode, submission, isExecuting, clearExecution } = useExecutionStore();

  // Auto-scroll to result when submission updates
  useEffect(() => {
    if (submission && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [submission]);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Format code function
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  useEffect(() => {
    getProblemById(id);
    getSubmissionCountForProblem(id);
    getInteractionStatus(id);

    // Clear previous execution results when shifting problems
    clearExecution();

    return () => {
      // Clear AI hints/suggestions on unmount
      clearAI();
      clearExecution();
    };
  }, [id]);

  useEffect(() => {
    if (problem) {
      // Normalize snippets keys to uppercase for easier lookup
      const snippets = problem.codeSnippets || {};
      const normalizedSnippets = Object.keys(snippets).reduce((acc, key) => {
        acc[key.toUpperCase()] = snippets[key];
        return acc;
      }, {});

      // Use submission source code if it belongs to THIS problem, otherwise use default snippet
      const initialCode = (submission?.problemId === id)
        ? (submission.sourceCode?.[selectedLanguage] || submission.sourceCode || "")
        : (normalizedSnippets[selectedLanguage.toUpperCase()] || "");

      setCode(initialCode);
      setTestCases(
        problem.testCases?.map((tc) => ({
          input: tc.input,
          output: tc.output,
        })) || []
      );
    }
  }, [problem, selectedLanguage, id]);

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id]);



  const handleLanguageChange = (e) => {
    const lang = e.target.value.toUpperCase();
    setSelectedLanguage(lang);

    // Normalize snippets keys for lookup
    const snippets = problem.codeSnippets || {};
    const normalizedSnippets = Object.keys(snippets).reduce((acc, key) => {
      acc[key.toUpperCase()] = snippets[key];
      return acc;
    }, {});

    setCode(normalizedSnippets[lang] || "");
  };

  const handleRunCode = (e) => {
    e.preventDefault();
    try {
      const language_id = getLanguageId(selectedLanguage);
      const stdin = problem.testCases.map((tc) => tc.input);
      const expected_outputs = problem.testCases.map((tc) => tc.output);
      executeCode(code, language_id, stdin, expected_outputs, id);
    } catch (error) {
      console.log("Error executing code", error);
    }
  };

  if (isProblemLoading || !problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="card bg-base-100 p-8 shadow-xl">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading problem...</p>
        </div>
      </div>
    );
  }

  const hasUnlockedSolution = Number(submissionCount || 0) > 0;
  const referenceSolutions = problem?.referenceSolutions || {};
  const selectedSolution =
    referenceSolutions[selectedLanguage] ||
    referenceSolutions[selectedLanguage.toLowerCase()] ||
    referenceSolutions[selectedLanguage.toUpperCase()] ||
    null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="prose max-w-none">
            <p className="text-lg mb-6">{problem.description}</p>

            {problem.examples && (
              <>
                <h3 className="text-xl font-bold mb-4">Examples:</h3>
                {Object.entries(problem.examples).map(([lang, example], idx) => (
                  <div key={lang} className="bg-base-200 p-6 rounded-xl mb-6 font-mono">
                    <div className="mb-4">
                      <div className="text-indigo-300 mb-2 text-base font-semibold">
                        Input:
                      </div>
                      <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                        {example.input}
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="text-indigo-300 mb-2 text-base font-semibold">
                        Output:
                      </div>
                      <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                        {example.output}
                      </span>
                    </div>
                    {example.explanation && (
                      <div>
                        <div className="text-emerald-300 mb-2 text-base font-semibold">
                          Explanation:
                        </div>
                        <p className="text-base-content/70 text-lg font-sem">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {problem.constraints && (
              <>
                <h3 className="text-xl font-bold mb-4">Constraints:</h3>
                <div className="bg-base-200 p-6 rounded-xl mb-6">
                  <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                    {problem.constraints}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      case "submissions":
        return <SubmissionsList submissions={submissions} isLoading={isSubmissionsLoading} />;
      case "discussion":
        return <Discussion problemId={id} />;
      case "hints":
        return (
          <div className="p-4 space-y-4">
            {/* Problem hints if available */}
            {problem?.hints && (
              <div className="bg-base-200 p-6 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Problem Hint
                </h4>
                <p className="text-base-content/80">{problem.hints}</p>
              </div>
            )}

            {/* AI Hints Section */}
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Assistant
                  <span className="badge badge-sm badge-primary">Powered by Gemini</span>
                </h4>

                <div className="flex gap-2 mb-3">
                  <button
                    className={`btn btn-primary btn-sm gap-1 ${isLoadingHint ? 'loading' : ''}`}
                    onClick={() => getHint(problem.description, code, selectedLanguage)}
                    disabled={isLoadingHint}
                  >
                    {!isLoadingHint && <Sparkles className="w-4 h-4" />}
                    Get Hint
                  </button>
                  <button
                    className={`btn btn-secondary btn-sm gap-1 ${isLoadingSuggestion ? 'loading' : ''}`}
                    onClick={() => getSuggestion(problem.description, code, selectedLanguage)}
                    disabled={isLoadingSuggestion || !code}
                  >
                    {!isLoadingSuggestion && <Wand2 className="w-4 h-4" />}
                    Review Code
                  </button>
                </div>

                {hint && (
                  <div className="bg-base-100 p-4 rounded-lg mb-2">
                    <h5 className="text-sm font-semibold text-primary mb-1">💡 Hint</h5>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">{hint}</p>
                  </div>
                )}

                {suggestion && (
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-secondary mb-1">🔍 Code Review</h5>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">{suggestion}</p>
                  </div>
                )}

                {!hint && !suggestion && (
                  <p className="text-sm text-base-content/60">
                    Click "Get Hint" for algorithm guidance or "Review Code" for feedback on your solution.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case "solution":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {problem?.editorial && (
              <div className="bg-[#252525] p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-6 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Editorial Analysis
                </h4>
                <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-sm">
                  {problem.editorial}
                </div>
              </div>
            )}

            <div className="bg-[#1e1e1e] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <div className="bg-[#282828] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Optimal Solution ({selectedLanguage})
                </h4>
                <div className="badge badge-sm badge-outline text-[10px] font-bold opacity-50 uppercase tracking-tighter">Verified</div>
              </div>
              {selectedSolution ? (
                <div className="h-[400px]">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(selectedLanguage)}
                    theme="vs-dark"
                    value={String(selectedSolution)}
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
              ) : (
                <div className="p-12 text-center opacity-40">
                  <Code2 className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No solution documented</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-gray-200 overflow-hidden">
      {/* Premium IDE Header */}
      <header className="h-14 border-b border-white/10 bg-[#282828] flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
            <Home className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{problem.title}</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-black">
              <span className={problem.difficulty === "EASY" ? "text-success" : problem.difficulty === "MEDIUM" ? "text-warning" : "text-error"}>
                {problem.difficulty}
              </span>
              <span>•</span>
              <Users className="w-3 h-3 inline" /> {submissionCount} submissions
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-[#1e1e1e] rounded-lg p-1 border border-white/5">
            {Object.keys(problem.codeSnippets || {}).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange({ target: { value: lang } })}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedLanguage === lang.toUpperCase()
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

          <div className="flex items-center gap-2">
            <button
              className={`btn btn-sm bg-[#1e1e1e] hover:bg-[#2a2a2a] border-white/10 text-gray-300 gap-2 ${isExecuting ? 'loading' : ''}`}
              onClick={handleRunCode}
              disabled={isExecuting}
            >
              {!isExecuting && <Play className="w-4 h-4 text-success fill-success" />}
              <span className="hidden sm:inline">Run</span>
            </button>
            <button
              className={`btn btn-sm btn-success gap-2 px-6 shadow-lg shadow-success/10 ${isExecuting ? 'loading' : ''}`}
              onClick={handleRunCode}
              disabled={isExecuting}
            >
              {!isExecuting && <Sparkles className="w-4 h-4 text-white" />}
              Submit
            </button>
          </div>

          <div className="ml-4 flex items-center gap-1">
            <button
              className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${interactionStatus?.isBookmarked ? 'text-primary' : 'text-gray-500'}`}
              onClick={() => interactionStatus?.isBookmarked ? removeBookmark(id) : bookmarkProblem(id)}
            >
              {interactionStatus?.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Solving Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Problem Details */}
        <div className="w-2/5 border-r border-white/10 bg-[#1e1e1e] flex flex-col shrink-0">
          <div className="flex items-center gap-4 px-4 bg-[#282828] border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', icon: FileText, label: 'Description' },
              { id: 'submissions', icon: Code2, label: 'Submissions' },
              { id: 'discussion', icon: MessageSquare, label: 'Discussion' },
              { id: 'hints', icon: Lightbulb, label: 'Solutions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-all text-xs font-bold uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-[#1a1a1a]">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Column: Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Code Editor Header */}
          <div className="h-10 px-4 bg-[#282828] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Code2 className="w-3 h-3" />
              Main.{selectedLanguage.toLowerCase()}
            </div>
            <button onClick={formatCode} className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
              <Wand2 className="w-3 h-3" />
              Format
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              key={`${id}-${selectedLanguage}`}
              height="100%"
              language={getMonacoLanguage(selectedLanguage)}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 20 },
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
              }}
              loading={<div className="flex items-center justify-center h-full"><span className="loading loading-spinner text-primary"></span></div>}
            />
          </div>

          {/* Console / Results Pane */}
          <div className={`border-t border-white/10 transition-all duration-300 flex flex-col ${showCustomTests ? 'h-80' : 'h-10'}`}>
            <button
              onClick={() => setShowCustomTests(!showCustomTests)}
              className="h-10 w-full px-4 bg-[#282828] flex items-center justify-between shrink-0 cursor-pointer hover:bg-white/5"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Terminal className="w-3 h-3" />
                Console & Test Cases
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showCustomTests ? 'rotate-90' : ''}`} />
            </button>

            {showCustomTests && (
              <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-4 text-xs">
                {submission ? (
                  <Submission submission={submission} />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="font-bold text-gray-500 uppercase tracking-tighter">Default Test Cases</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {testCases.map((tc, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <div className="text-gray-500 mb-1 font-bold">Input</div>
                          <div className="font-mono text-gray-300 mb-2">{tc.input}</div>
                          <div className="text-gray-500 mb-1 font-bold">Expected Output</div>
                          <div className="font-mono text-gray-300">{tc.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProblemPage;
