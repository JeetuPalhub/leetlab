import React from 'react';
import { CheckCircle2, XCircle, Clock, MemoryStick as Memory } from 'lucide-react';
import Editor from '@monaco-editor/react';

const SubmissionResults = ({ submission }) => {
  // Parse stringified arrays
  const memoryArr = JSON.parse(submission.memory || '[]');
  const timeArr = JSON.parse(submission.time || '[]');

  // Calculate averages
  const avgMemory = memoryArr
    .map(m => parseFloat(m)) // remove ' KB' using parseFloat
    .reduce((a, b) => a + b, 0) / memoryArr.length;

  const avgTime = timeArr
    .map(t => parseFloat(t)) // remove ' s' using parseFloat
    .reduce((a, b) => a + b, 0) / timeArr.length;

  const passedTests = submission.testCases.filter(tc => tc.passed).length;
  const totalTests = submission.testCases.length;
  const successRate = (passedTests / totalTests) * 100;

  // Format output for display
  const formatOutput = (output) => {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return output || 'null';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Status</h3>
            <div className={`text-lg font-bold ${submission.status === 'Accepted' ? 'text-success' : 'text-error'
              }`}>
              {submission.status}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Success Rate</h3>
            <div className="text-lg font-bold">
              {successRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h3 className="card-title text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Runtime
            </h3>
            <div className="text-lg font-bold">
              {avgTime.toFixed(3)} s
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h3 className="card-title text-sm flex items-center gap-2">
              <Memory className="w-4 h-4" />
              Avg. Memory
            </h3>
            <div className="text-lg font-bold">
              {avgMemory.toFixed(0)} KB
            </div>
          </div>
        </div>
      </div>

      {/* Test Cases Results */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Test Cases Results</h2>
          <div className="space-y-4">
            {submission.testCases.map((testCase, index) => (
              <div key={testCase.id} className={`card ${testCase.passed ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'}`}>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Test Case {index + 1}</span>
                    <div className="flex items-center gap-4">
                      {testCase.passed ? (
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="w-5 h-5" />
                          Passed
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-error">
                          <XCircle className="w-5 h-5" />
                          Failed
                        </div>
                      )}
                      <span className="text-xs text-base-content/60">{testCase.time} | {testCase.memory}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-base-content/60 mb-1 block">Expected Output</label>
                      <div className="bg-base-300 rounded-lg overflow-hidden h-20">
                        <Editor
                          height="100%"
                          language="json"
                          theme="vs-dark"
                          value={formatOutput(testCase.expected)}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            wordWrap: 'on',
                            folding: false,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-base-content/60 mb-1 block">Your Output</label>
                      <div className={`rounded-lg overflow-hidden h-20 ${testCase.passed ? 'bg-success/20' : 'bg-error/20'}`}>
                        <Editor
                          height="100%"
                          language="json"
                          theme="vs-dark"
                          value={formatOutput(testCase.stdout)}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            wordWrap: 'on',
                            folding: false,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResults;
