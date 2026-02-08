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
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId } from "../libs/utils";
import { useExecutionStore } from "../store/useExecution";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { useInteractionStore } from "../store/useInteractionStore";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const { submission: submissions, isLoading: isSubmissionsLoading, getSubmissionForProblem, getSubmissionCountForProblem, submissionCount } = useSubmissionStore();
  const { interactionStatus, getInteractionStatus, likeProblem, unlikeProblem, bookmarkProblem, removeBookmark } = useInteractionStore();
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [testCases, setTestCases] = useState([]);
  const [customTestCases, setCustomTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [showCustomTests, setShowCustomTests] = useState(false);
  const editorRef = useRef(null);

  const { executeCode, submission, isExecuting } = useExecutionStore();

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
  }, [id]);

  useEffect(() => {
    if (problem) {
      setCode(problem.codeSnippets?.[selectedLanguage] || submission?.sourceCode || "");
      setTestCases(
        problem.testCases?.map((tc) => ({
          input: tc.input,
          output: tc.output,
        })) || []
      );
    }
  }, [problem, selectedLanguage]);

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id]);

  console.log("Submissions:", JSON.stringify(submissions));

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(problem.codeSnippets?.[lang] || "");
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
        return <div className="p-4 text-center text-base-content/70">No discussions yet</div>;
      case "hints":
        return (
          <div className="p-4">
            {problem?.hints ? (
              <div className="bg-base-200 p-6 rounded-xl">
                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                  {problem.hints}
                </span>
              </div>
            ) : (
              <div className="text-center text-base-content/70">No hints available</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200">
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1 gap-2">
          <Link to={'/'} className="flex items-center gap-2 text-primary">
            <Home className="w-6 h-6" />
            <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="mt-2">
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-base-content/70 mt-5">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date(problem.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
              <span className="text-base-content/30">•</span>
              <Users className="w-4 h-4" />
              <span>{submissionCount} Submissions</span>
              <span className="text-base-content/30">•</span>
              <ThumbsUp className="w-4 h-4" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
        <div className="flex-none gap-2">
          <button
            className={`btn btn-ghost btn-circle ${interactionStatus?.isLiked ? 'text-error' : ''}`}
            onClick={() => interactionStatus?.isLiked ? unlikeProblem(id) : likeProblem(id)}
            title={interactionStatus?.isLiked ? "Unlike" : "Like"}
          >
            {interactionStatus?.isLiked ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
          </button>
          <span className="text-sm">{interactionStatus?.likeCount || 0}</span>
          <button
            className={`btn btn-ghost btn-circle ${interactionStatus?.isBookmarked ? 'text-primary' : ''}`}
            onClick={() => interactionStatus?.isBookmarked ? removeBookmark(id) : bookmarkProblem(id)}
            title={interactionStatus?.isBookmarked ? "Remove Bookmark" : "Bookmark for Revision"}
          >
            {interactionStatus?.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          <button className="btn btn-ghost btn-circle">
            <Share2 className="w-5 h-5" />
          </button>
          <select
            className="select select-bordered select-primary w-40"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {Object.keys(problem.codeSnippets || {}).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="tabs tabs-bordered">
                <button
                  className={`tab gap-2 ${activeTab === "description" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("description")}
                >
                  <FileText className="w-4 h-4" />
                  Description
                </button>
                <button
                  className={`tab gap-2 ${activeTab === "submissions" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("submissions")}
                >
                  <Code2 className="w-4 h-4" />
                  Submissions
                </button>
                <button
                  className={`tab gap-2 ${activeTab === "discussion" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("discussion")}
                >
                  <MessageSquare className="w-4 h-4" />
                  Discussion
                </button>
                <button
                  className={`tab gap-2 ${activeTab === "hints" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("hints")}
                >
                  <Lightbulb className="w-4 h-4" />
                  Hints
                </button>
              </div>

              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="tabs tabs-bordered">
                <button className="tab tab-active gap-2">
                  <Terminal className="w-4 h-4" />
                  Code Editor
                </button>
              </div>

              <div className="h-[600px] w-full">
                <Editor
                  key={`${id}-${selectedLanguage}`}
                  height="100%"
                  language={selectedLanguage === 'JAVASCRIPT' ? 'javascript' : selectedLanguage === 'PYTHON' ? 'python' : selectedLanguage === 'JAVA' ? 'java' : selectedLanguage.toLowerCase()}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    folding: true,
                    foldingHighlight: true,
                  }}
                  loading={<div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary"></span></div>}
                />
              </div>

              <div className="p-4 border-t border-base-300 bg-base-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-sm gap-1"
                      onClick={formatCode}
                      title="Format Code (Shift+Alt+F)"
                    >
                      <Wand2 className="w-4 h-4" />
                      Format
                    </button>
                    <button
                      className={`btn btn-ghost btn-sm gap-1 ${showCustomTests ? 'btn-active' : ''}`}
                      onClick={() => setShowCustomTests(!showCustomTests)}
                    >
                      <Plus className="w-4 h-4" />
                      Custom Tests
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-primary gap-2 ${isExecuting ? 'loading' : ''}`}
                      onClick={handleRunCode}
                      disabled={isExecuting}
                    >
                      {!isExecuting && <Play className="w-4 h-4" />}
                      Run Code
                    </button>
                    <button
                      className={`btn btn-success gap-2 ${isExecuting ? 'loading' : ''}`}
                      onClick={handleRunCode}
                      disabled={isExecuting}
                    >
                      {!isExecuting && <Play className="w-4 h-4" />}
                      Submit
                    </button>
                  </div>
                </div>

                {/* Custom Test Cases Panel */}
                {showCustomTests && (
                  <div className="mt-4 p-4 bg-base-100 rounded-lg">
                    <h4 className="font-semibold mb-2">Custom Test Cases</h4>
                    {customTestCases.map((tc, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Input"
                          className="input input-bordered input-sm flex-1 font-mono"
                          value={tc.input}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[index].input = e.target.value;
                            setCustomTestCases(updated);
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Expected Output (optional)"
                          className="input input-bordered input-sm flex-1 font-mono"
                          value={tc.expectedOutput}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[index].expectedOutput = e.target.value;
                            setCustomTestCases(updated);
                          }}
                        />
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => {
                            if (customTestCases.length > 1) {
                              setCustomTestCases(customTestCases.filter((_, i) => i !== index));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn btn-ghost btn-xs mt-2"
                      onClick={() => setCustomTestCases([...customTestCases, { input: "", expectedOutput: "" }])}
                    >
                      <Plus className="w-3 h-3" /> Add Test Case
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            {submission ? (
              <Submission submission={submission} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Test Cases</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Input</th>
                        <th>Expected Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCases.map((testCase, index) => (
                        <tr key={index}>
                          <td className="font-mono">{testCase.input}</td>
                          <td className="font-mono">{testCase.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;