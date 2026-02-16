import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import {
  Play,
  FileText,
  MessageSquare,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  ChevronUp,
  BookOpen,
  Terminal,
  Code2,
  Users,
  Home,
  Wand2,
  Sparkles,
  Bot,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  Columns,
  Maximize2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId, getMonacoLanguage } from "../libs/utils";
import { useExecutionStore } from "../store/useExecution";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { useInteractionStore } from "../store/useInteractionStore";
import { useAIStore } from "../store/useAIStore";
import Skeleton from "../components/Skeleton";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";
import Discussion from "../components/Discussion";

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const {
    submission: submissions,
    isLoading: isSubmissionsLoading,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
    submissionCount,
    pagination: submissionPagination,
  } = useSubmissionStore();
  const {
    interactionStatus,
    getInteractionStatus,
    likeProblem,
    unlikeProblem,
    bookmarkProblem,
    removeBookmark,
  } = useInteractionStore();
  const {
    hint,
    suggestion,
    solution,
    isLoadingHint,
    isLoadingSuggestion,
    isLoadingSolution,
    getHint,
    getSuggestion,
    getSolution,
    clearAI,
  } = useAIStore();

  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [testCases, setTestCases] = useState([]);
  const [showConsole, setShowConsole] = useState(true);

  // Mobile: "problem" shows left panel, "code" shows editor
  const [mobileView, setMobileView] = useState("problem");
  // Desktop: toggle left panel
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  const editorRef = useRef(null);

  const { executeCode, submission, isExecuting, clearExecution } =
    useExecutionStore();

  // Auto-open console when code finishes executing
  useEffect(() => {
    if (submission) {
      setShowConsole(true);
    }
  }, [submission]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  useEffect(() => {
    getProblemById(id);
    getSubmissionCountForProblem(id);
    getInteractionStatus(id);
    clearExecution();
    return () => {
      clearAI();
      clearExecution();
    };
  }, [id]);

  useEffect(() => {
    if (problem) {
      const snippets = problem.codeSnippets || {};
      const normalizedSnippets = Object.keys(snippets).reduce((acc, key) => {
        acc[key.toUpperCase()] = snippets[key];
        return acc;
      }, {});

      // 1. Try localStorage
      const savedCode = localStorage.getItem(`leetlab_code_${id}_${selectedLanguage}`);

      if (savedCode) {
        setCode(savedCode);
      } else {
        // 2. Try submission (if it's for this problem)
        const initialCode =
          submission?.problemId === id
            ? submission.sourceCode?.[selectedLanguage] ||
            submission.sourceCode ||
            ""
            : normalizedSnippets[selectedLanguage.toUpperCase()] || "";
        setCode(initialCode);
      }

      setTestCases(
        problem.testCases?.map((tc) => ({
          input: tc.input,
          output: tc.output,
        })) || []
      );
    }
  }, [problem, selectedLanguage, id]);

  // Persistence effect: save to localStorage on change
  useEffect(() => {
    if (id && selectedLanguage && code) {
      localStorage.setItem(`leetlab_code_${id}_${selectedLanguage}`, code);
    }
  }, [code, id, selectedLanguage]);

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id]);

  const handleLanguageChange = (langValue) => {
    const lang = langValue.toString().toUpperCase();
    setSelectedLanguage(lang);

    // Check localStorage first
    const savedCode = localStorage.getItem(`leetlab_code_${id}_${lang}`);
    if (savedCode) {
      setCode(savedCode);
      return;
    }

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
      setShowConsole(true);
      // On mobile, switch to code view to see results
      setMobileView("code");
    } catch (error) {
      console.log("Error executing code", error);
      toast.error("Failed to execute code");
    }
  };

  // ── Loading state with Skeletons ──
  if (isProblemLoading || !problem) {
    return (
      <div className="flex flex-col h-screen bg-[#0d1117] text-gray-200 overflow-hidden">
        {/* Header Skeleton */}
        <header className="h-12 border-b border-gray-800 bg-[#161b22] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </header>

        {/* Tab Switcher Skeleton (Mobile) */}
        <div className="lg:hidden flex border-b border-gray-800">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="flex-1 h-10" />
        </div>

        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel Skeleton (Desktop) */}
          <div className="hidden lg:flex w-[35%] flex-col border-r border-gray-800 p-4 space-y-4">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="pt-4 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* Editor Skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="h-9 bg-[#161b22] border-b border-gray-800 px-3 flex items-center">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex-1 p-4">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="h-9 bg-[#161b22] border-t border-gray-800 px-3 flex items-center">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </main>
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

  const tabs = [
    { id: "description", icon: FileText, label: "Description" },
    { id: "submissions", icon: Code2, label: "Submissions" },
    { id: "discussion", icon: MessageSquare, label: "Discussion" },
    { id: "hints", icon: Lightbulb, label: "AI & Solutions" },
  ];

  // ──────────────────────────────────────
  // Tab Content Renderer
  // ──────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="space-y-5">
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {problem.description}
            </p>

            {problem.examples && (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Examples</h3>
                {Object.entries(problem.examples).map(([lang, example]) => (
                  <div
                    key={lang}
                    className="bg-[#161b22] rounded-xl p-3 sm:p-4 border border-gray-800 space-y-2.5"
                  >
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-blue-400 uppercase tracking-wide">
                        Input
                      </span>
                      <div className="mt-1 bg-black/40 px-3 py-2 rounded-lg font-mono text-xs sm:text-sm text-gray-200 overflow-x-auto whitespace-nowrap">
                        {example.input}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                        Output
                      </span>
                      <div className="mt-1 bg-black/40 px-3 py-2 rounded-lg font-mono text-xs sm:text-sm text-gray-200 overflow-x-auto whitespace-nowrap">
                        {example.output}
                      </div>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-[10px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wide">
                          Explanation
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-gray-400">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {problem.constraints && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">Constraints</h3>
                <div className="bg-[#161b22] rounded-xl p-3 sm:p-4 border border-gray-800">
                  <code className="text-xs sm:text-sm text-amber-300 break-all">
                    {problem.constraints}
                  </code>
                </div>
              </div>
            )}
          </div>
        );

      case "submissions":
        const handleLoadMoreSubmissions = () => {
          if (submissionPagination.hasMore) {
            getSubmissionForProblem(id, submissionPagination.currentPage + 1, submissionPagination.limit, true);
          }
        };
        return (
          <SubmissionsList
            submissions={submissions}
            isLoading={isSubmissionsLoading}
            pagination={submissionPagination}
            onLoadMore={handleLoadMoreSubmissions}
          />
        );

      case "discussion":
        return <Discussion problemId={id} />;

      case "hints":
        return (
          <div className="space-y-4">
            {problem?.hints && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4" /> Problem Hint
                </h4>
                <p className="text-xs sm:text-sm text-gray-300">{problem.hints}</p>
              </div>
            )}

            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm flex-wrap">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                AI Assistant
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  Groq AI
                </span>
              </h4>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className={`btn btn-xs sm:btn-sm gap-1 ${isLoadingHint ? "loading" : "btn-primary"}`}
                  onClick={() =>
                    getHint(problem.description, code, selectedLanguage)
                  }
                  disabled={isLoadingHint || isLoadingSolution || isLoadingSuggestion}
                >
                  {!isLoadingHint && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  Hint
                </button>
                <button
                  className={`btn btn-xs sm:btn-sm gap-1 ${isLoadingSuggestion ? "loading" : "btn-secondary"}`}
                  onClick={() =>
                    getSuggestion(problem.description, code, selectedLanguage)
                  }
                  disabled={isLoadingHint || isLoadingSolution || isLoadingSuggestion || !code}
                >
                  {!isLoadingSuggestion && <Wand2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  Review
                </button>
                <button
                  className={`btn btn-xs sm:btn-sm gap-1 ${isLoadingSolution ? "loading" : "btn-accent"}`}
                  onClick={() =>
                    getSolution(problem.description, selectedLanguage)
                  }
                  disabled={isLoadingHint || isLoadingSolution || isLoadingSuggestion}
                >
                  {!isLoadingSolution && <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  Solution
                </button>
              </div>

              {hint && (
                <div className="bg-black/30 rounded-lg p-3 mb-3 border border-blue-500/10">
                  <h5 className="text-xs font-bold text-blue-400 mb-1.5">💡 Hint</h5>
                  <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {hint}
                  </p>
                </div>
              )}

              {suggestion && (
                <div className="bg-black/30 rounded-lg p-3 mb-3 border border-purple-500/10">
                  <h5 className="text-xs font-bold text-purple-400 mb-1.5">🔍 Code Review</h5>
                  <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              )}

              {solution && (
                <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-bold text-emerald-400">🤖 AI Solution</h5>
                    <button
                      className="btn btn-ghost btn-xs gap-1 text-gray-400 hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(solution);
                        toast.success("Copied!");
                      }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="text-[11px] sm:text-xs bg-black/40 p-3 rounded-lg font-mono text-gray-300 whitespace-pre-wrap break-words overflow-x-auto max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                    {solution}
                  </pre>
                </div>
              )}

              {!hint && !suggestion && !solution && (
                <p className="text-xs text-gray-500">
                  Click a button above to get AI-powered help.
                </p>
              )}
            </div>

            {/* Reference Solution (only if user has submissions) */}
            {hasUnlockedSolution && (
              <div className="bg-[#161b22] rounded-xl overflow-hidden border border-gray-800">
                <div className="px-3 sm:px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                    Reference ({selectedLanguage})
                  </h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Verified
                  </span>
                </div>
                {selectedSolution ? (
                  <div className="h-[200px] sm:h-[300px]">
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(selectedLanguage)}
                      theme="vs-dark"
                      value={String(selectedSolution)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: "on",
                        padding: { top: 12 },
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-600">
                    <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold uppercase">No reference solution</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ──────────────────────────────────────
  // Left Panel Component (reusable for both mobile and desktop)
  // ──────────────────────────────────────
  const LeftPanel = () => (
    <>
      {/* Tabs */}
      <div className="flex items-center bg-[#161b22] border-b border-gray-800 shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 border-b-2 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
          >
            <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 min-h-0">
        {renderTabContent()}
      </div>
    </>
  );

  // ──────────────────────────────────────
  // Editor + Console Component (reusable for both mobile and desktop)
  // ──────────────────────────────────────
  const EditorPanel = () => (
    <PanelGroup orientation="vertical">
      <Panel defaultSize={75} minSize={20}>
        <div className="flex flex-col h-full">
          {/* Editor Header */}
          <div className="h-8 sm:h-9 px-3 bg-[#161b22] border-b border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-mono">
              <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              main.{selectedLanguage.toLowerCase()}
            </div>
            <button
              onClick={formatCode}
              className="text-[10px] sm:text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              <span className="hidden sm:inline">Format</span>
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 bg-[#0d1117]">
            <Editor
              key={`${id}-${selectedLanguage}`}
              height="100%"
              language={getMonacoLanguage(selectedLanguage)}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 12 },
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              }
            />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="h-1.5 hover:bg-blue-600/30 transition-colors border-t border-gray-800 cursor-row-resize shrink-0 pb-[1px]" />

      {/* ── Console / Test Cases ── */}
      <Panel
        defaultSize={25}
        minSize={10}
        collapsible
        onCollapse={() => setShowConsole(false)}
        onExpand={() => setShowConsole(true)}
      >
        <div className="h-full flex flex-col bg-[#0d1117]">
          {/* Toggle Bar — always visible even if collapsed by library, but we handle it via buttons too */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="h-9 w-full px-3 bg-[#161b22] flex items-center justify-between shrink-0 cursor-pointer hover:bg-[#1c2129] transition-colors border-b border-gray-800"
          >
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-400">
              <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>Console & Test Cases</span>
              {submission && (
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${submission.status === "Accepted"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                    }`}
                >
                  {submission.status}
                </span>
              )}
            </div>
            <ChevronUp
              className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showConsole ? "" : "rotate-180"
                }`}
            />
          </button>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 min-h-0">
            {submission ? (
              <Submission submission={submission} />
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Test Cases
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="bg-[#161b22] rounded-lg p-2 sm:p-3 border border-gray-800"
                    >
                      <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Case {idx + 1}
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-400 font-semibold">
                          Input:{" "}
                        </span>
                        <code className="text-[11px] sm:text-xs text-gray-300 font-mono break-all">
                          {tc.input}
                        </code>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          Expected:{" "}
                        </span>
                        <code className="text-[11px] sm:text-xs text-gray-300 font-mono break-all">
                          {tc.output}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );

  // ──────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-gray-200 overflow-hidden">
      {/* ═══════════════════════════════════
          HEADER
      ═══════════════════════════════════ */}
      <header className="h-11 sm:h-12 border-b border-gray-800 bg-[#161b22] flex items-center justify-between px-2 sm:px-3 z-50 shrink-0">
        {/* Left: Nav + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <Link
            to="/problems"
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
          >
            <Home className="w-4 h-4" />
          </Link>

          {/* Desktop: toggle left panel */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0 hidden lg:flex"
            title={showLeftPanel ? "Hide problem panel" : "Show problem panel"}
          >
            {showLeftPanel ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <div className="h-4 w-px bg-gray-700 mx-0.5 shrink-0 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[200px] md:max-w-md">
              {problem.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-gray-500 font-bold">
              <span
                className={
                  problem.difficulty === "EASY"
                    ? "text-emerald-400"
                    : problem.difficulty === "MEDIUM"
                      ? "text-amber-400"
                      : "text-red-400"
                }
              >
                {problem.difficulty}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />
                {submissionCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Language + Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language pills — desktop only */}
          <div className="hidden lg:flex items-center bg-black/30 rounded-lg p-0.5 border border-gray-800">
            {Object.keys(problem.codeSnippets || {}).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${selectedLanguage === lang.toUpperCase()
                  ? "bg-blue-600/30 text-blue-300"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Language dropdown — tablet & mobile */}
          <select
            className="select select-xs select-bordered bg-[#0d1117] border-gray-700 text-[10px] sm:text-xs lg:hidden min-w-0 w-auto max-w-[100px]"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {Object.keys(problem.codeSnippets || {}).map((lang) => (
              <option key={lang} value={lang.toUpperCase()}>
                {lang}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-gray-700 mx-0.5 hidden sm:block" />

          <button
            className={`btn btn-xs bg-[#21262d] hover:bg-[#30363d] border-gray-700 text-gray-300 gap-1 ${isExecuting ? "loading" : ""
              }`}
            onClick={handleRunCode}
            disabled={isExecuting}
          >
            {!isExecuting && (
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 fill-emerald-400" />
            )}
            <span className="hidden sm:inline text-xs">Run</span>
          </button>

          <button
            className={`btn btn-xs btn-success gap-1 px-2 sm:px-4 ${isExecuting ? "loading" : ""
              }`}
            onClick={handleRunCode}
            disabled={isExecuting}
          >
            {!isExecuting && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            <span className="text-xs">Submit</span>
          </button>

          <button
            className={`btn btn-xs btn-ghost ${interactionStatus?.isBookmarked ? "text-blue-400" : "text-gray-500"
              }`}
            onClick={() =>
              interactionStatus?.isBookmarked
                ? removeBookmark(id)
                : bookmarkProblem(id)
            }
          >
            {interactionStatus?.isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════
          MOBILE VIEW SWITCHER (< lg)
      ═══════════════════════════════════ */}
      <div className="lg:hidden flex items-center bg-[#161b22] border-b border-gray-800 shrink-0">
        <button
          onClick={() => setMobileView("problem")}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${mobileView === "problem"
            ? "text-blue-400 bg-blue-500/10 border-b-2 border-blue-500"
            : "text-gray-500 hover:text-gray-300"
            }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
          Problem
        </button>
        <button
          onClick={() => setMobileView("code")}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${mobileView === "code"
            ? "text-emerald-400 bg-emerald-500/10 border-b-2 border-emerald-500"
            : "text-gray-500 hover:text-gray-300"
            }`}
        >
          <Code2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
          Code Editor
        </button>
      </div>

      {/* ═══════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════ */}

      {/* ── MOBILE LAYOUT (< lg): show one panel at a time ── */}
      <main className="flex-1 flex flex-col lg:hidden overflow-hidden min-h-0">
        {mobileView === "problem" ? (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <LeftPanel />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <EditorPanel />
          </div>
        )}
      </main>

      {/* ── DESKTOP LAYOUT (>= lg): side-by-side with resizable panels ── */}
      <main className="flex-1 hidden lg:flex overflow-hidden min-h-0">
        <PanelGroup orientation="horizontal">
          {/* Left Panel */}
          {showLeftPanel && (
            <>
              <Panel defaultSize={35} minSize={20} className="flex flex-col">
                <div className="h-full border-r border-gray-800 bg-[#0d1117] flex flex-col min-w-0">
                  <LeftPanel />
                </div>
              </Panel>
              <PanelResizeHandle className="w-1.5 hover:bg-blue-600/30 transition-colors border-r border-gray-800 cursor-col-resize shrink-0" />
            </>
          )}

          {/* Right Panel: Editor + Console */}
          <Panel minSize={30}>
            <div className="flex-1 flex flex-col min-w-0 h-full bg-[#0d1117]">
              <EditorPanel />
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
};

export default ProblemPage;
