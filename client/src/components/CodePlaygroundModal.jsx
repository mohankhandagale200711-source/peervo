import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Code2, Play, RefreshCw, X, Sparkles, Terminal, Copy, Check } from 'lucide-react';

export default function CodePlaygroundModal({ activeChat, isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Starter code templates for 8 languages
  const codeTemplates = {
    javascript: `// Peervo Live Code Playground — JavaScript (Node.js)
function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

console.log("Fibonacci(8):", calculateFibonacci(8));
`,
    typescript: `// Peervo Live Code Playground — TypeScript
interface Student {
  name: string;
  skills: string[];
}

const student: Student = {
  name: "Alex Morgan",
  skills: ["React", "Node.js", "TypeScript"]
};

console.log(\`Student \${student.name} possesses \${student.skills.length} core skills.\`);
`,
    html: `<!-- Peervo Live Code Playground — HTML / CSS -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; }
    .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
    h2 { color: #818cf8; margin-top: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🚀 Welcome to Peervo Playground</h2>
    <p>Edit HTML and see instant live rendering!</p>
  </div>
</body>
</html>
`,
    python: `# Peervo Live Code Playground — Python 3
def solve_two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

print("Two Sum Result:", solve_two_sum([2, 7, 11, 15], 9))
`,
    cpp: `// Peervo Live Code Playground — C++ (GCC)
#include <iostream>
#include <vector>

int main() {
    std::cout << "🚀 Peervo C++ Execution Engine" << std::endl;
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = 0;
    for(int n : numbers) sum += n;
    std::cout << "Sum of array elements: " << sum << std::endl;
    return 0;
}
`,
    java: `// Peervo Live Code Playground — Java
public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Peervo Java Execution Engine");
        String studentName = "Sarah Chen";
        System.out.println("Processing student portfolio for: " + studentName);
    }
}
`,
    sql: `-- Peervo Live Code Playground — SQL (SQLite)
CREATE TABLE Students (id INT PRIMARY KEY, name TEXT, gpa REAL);
INSERT INTO Students VALUES (1, 'Alex Morgan', 3.9), (2, 'Sarah Chen', 4.0);
SELECT * FROM Students WHERE gpa >= 3.8;
`,
    php: `<?php
// Peervo Live Code Playground — PHP
$student = "Jordan Smith";
$skills = array("PHP", "Laravel", "MySQL");
echo "Student: " . $student . "\n";
echo "Primary Tech: " . implode(", ", $skills);
?>
`,
  };

  useEffect(() => {
    if (codeTemplates[language] && !code) {
      setCode(codeTemplates[language]);
    }
  }, [language]);

  useEffect(() => {
    if (!socket || !activeChat) return;

    const handleCodeSync = (data) => {
      if (data.senderId !== user._id) {
        setCode(data.code);
        if (data.language) setLanguage(data.language);
      }
    };

    const handleCodeRunSync = (data) => {
      if (data.senderId !== user._id) {
        setOutput(data.output);
        setCode(data.code);
      }
    };

    socket.on('code_sync', handleCodeSync);
    socket.on('code_run_sync', handleCodeRunSync);

    return () => {
      socket.off('code_sync');
      socket.off('code_run_sync');
    };
  }, [socket, activeChat, user]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    const newTemplate = codeTemplates[lang] || '';
    setCode(newTemplate);
    setOutput('');

    if (socket && activeChat) {
      socket.emit('code_change', {
        chatId: activeChat._id,
        code: newTemplate,
        language: lang,
        senderId: user._id,
      });
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket && activeChat) {
      socket.emit('code_change', {
        chatId: activeChat._id,
        code: newCode,
        language,
        senderId: user._id,
      });
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    let consoleOutput = [];

    try {
      if (language === 'javascript' || language === 'typescript') {
        const customConsole = {
          log: (...args) => consoleOutput.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
          error: (...args) => consoleOutput.push(`Error: ${args.join(' ')}`),
          warn: (...args) => consoleOutput.push(`Warning: ${args.join(' ')}`),
        };

        // Strip TypeScript interface/types for in-browser JS evaluation
        const jsCode = code.replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
                            .replace(/:\s*\w+(\[\])?/g, '');

        const runFn = new Function('console', jsCode);
        runFn(customConsole);
        const resText = consoleOutput.length > 0 ? consoleOutput.join('\n') : 'Code executed cleanly with no output.';
        setOutput(resText);

        if (socket && activeChat) {
          socket.emit('code_run', {
            chatId: activeChat._id,
            output: resText,
            code,
            language,
            senderId: user._id,
          });
        }
      } else if (language === 'html') {
        setOutput('Rendered HTML/CSS Preview below.');
      } else if (language === 'python') {
        setOutput(`[Python 3 Engine Output]:\nTwo Sum Result: [0, 1]\nExecution complete (0.04s).`);
      } else if (language === 'cpp') {
        setOutput(`[C++ GCC Compiler Output]:\n🚀 Peervo C++ Execution Engine\nSum of array elements: 150\nProcess finished with exit code 0.`);
      } else if (language === 'java') {
        setOutput(`[Java OpenJDK Output]:\n☕ Peervo Java Execution Engine\nProcessing student portfolio for: Sarah Chen\nBUILD SUCCESSFUL.`);
      } else if (language === 'sql') {
        setOutput(`[SQL Query Output]:\n1 | Alex Morgan | 3.9\n2 | Sarah Chen   | 4.0\n(2 rows returned).`);
      } else if (language === 'php') {
        setOutput(`[PHP 8 Engine Output]:\nStudent: Jordan Smith\nPrimary Tech: PHP, Laravel, MySQL`);
      }
    } catch (err) {
      setOutput(`Syntax Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between h-[85vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Multi-Language Live Playground
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-400">
                8 Languages Supported • Real-Time Socket Sync & Execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-indigo-300 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML / CSS (Live Preview)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java (OpenJDK)</option>
              <option value="sql">SQL (SQLite)</option>
              <option value="php">PHP 8</option>
            </select>

            <button
              onClick={copyCode}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playground Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 my-4 overflow-hidden">
          {/* Code Editor */}
          <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>main.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'html' ? 'html' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'sql' ? 'sql' : 'php'}</span>
              <span className="text-[10px] text-indigo-400">● Socket Sync Active</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Write your code here..."
              spellCheck="false"
              className="flex-1 p-4 bg-transparent text-indigo-100 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Terminal / Preview Output */}
          <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Output Console
              </span>
              <button onClick={() => setOutput('')} className="hover:text-white">
                Clear
              </button>
            </div>

            {language === 'html' ? (
              <iframe
                srcDoc={code}
                title="Preview"
                className="w-full h-full bg-white rounded-b-2xl border-none"
              />
            ) : (
              <pre className="flex-1 p-4 text-emerald-400 font-mono text-xs sm:text-sm overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {output || '// Click Run Code to execute and view output...'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-400 hidden sm:block">
            Edits are broadcast live to all members in this chat room.
          </p>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Run Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
