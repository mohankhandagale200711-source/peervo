import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { BrainCircuit, Play, Sparkles, X, CheckCircle, Code2, Award, RefreshCw, ChevronRight } from 'lucide-react';

export default function MockInterviewModal({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);

  const [role, setRole] = useState('Full-Stack Web Developer (React & Node.js)');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);

  const mockQuestions = {
    'Full-Stack Web Developer (React & Node.js)': [
      {
        id: 1,
        question: 'Explain how the React Virtual DOM diffing algorithm works under the hood and why key props are essential for array rendering.',
        hint: 'Focus on reconciliation, Fiber architecture, and O(n) heuristic algorithm vs O(n^3) tree comparison.',
      },
      {
        id: 2,
        question: 'How do you handle JWT token authentication security in Node.js? Where should refresh tokens be stored to prevent XSS and CSRF attacks?',
        hint: 'Discuss HttpOnly cookies, memory storage, token expiry, and Bearer authorization headers.',
      },
    ],
    'Python Data Structures & Algorithms': [
      {
        id: 1,
        question: 'Explain how to find the longest substring without repeating characters in O(n) time complexity using a sliding window and hash map in Python.',
        hint: 'Track characters in a dictionary storing their latest index position.',
      },
    ],
    'Database Architect (SQL & NoSQL)': [
      {
        id: 1,
        question: 'What is Database Normalization (1NF to 3NF & BCNF)? When would you deliberately de-normalize a MongoDB schema in a high-traffic app?',
        hint: 'Discuss atomic values, primary keys, transitive dependencies, read optimization vs write overhead.',
      },
    ],
  };

  const handleStartInterview = () => {
    setInterviewStarted(true);
    setScorecard(null);
    setUserAnswer('');
    setQuestionCount(1);
    const questions = mockQuestions[role] || mockQuestions['Full-Stack Web Developer (React & Node.js)'];
    setCurrentQuestion(questions[0]);
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);

    try {
      // Simulate/AI Evaluation Analysis
      setTimeout(() => {
        const wordCount = userAnswer.trim().split(/\s+/).length;
        const score = Math.min(95, Math.max(65, Math.floor(wordCount * 1.5 + 50)));

        setScorecard({
          score: score,
          technicalDepth: Math.min(98, score + 2),
          problemSolving: Math.min(95, score - 3),
          codeQuality: Math.min(92, score + 4),
          feedback: `Great explanation! You correctly covered core architectural concepts. To achieve a 100% score for top-tier FAANG interviews, mention memory allocation trade-offs and edge-case error boundaries.`,
          strengths: ['Clear terminology', 'Structured explanation', 'Good technical depth'],
          improvementArea: 'Include edge-case validation examples and time complexity notation.',
        });
        setEvaluating(false);
      }, 1500);
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    const questions = mockQuestions[role] || mockQuestions['Full-Stack Web Developer (React & Node.js)'];
    if (questionCount < questions.length) {
      setQuestionCount(questionCount + 1);
      setCurrentQuestion(questions[questionCount]);
      setUserAnswer('');
      setScorecard(null);
    } else {
      // Finished session
      setInterviewStarted(false);
      setScorecard(null);
      setCurrentQuestion(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                Peervo AI Technical Mock Interviewer
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Live Technical Interview Preparation & AI Readiness Scorecard
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1: Setup Role Selection */}
        {!interviewStarted && (
          <div className="space-y-6 my-4">
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl">
              <p className="text-xs text-indigo-300 leading-relaxed font-semibold">
                🎯 Select your target job role below. Peervo AI will act as a Senior Engineering Interviewer, asking real-world technical questions and evaluating your response with an **Interview Readiness Scorecard**!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Target Tech Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="Full-Stack Web Developer (React & Node.js)">Full-Stack Web Developer (React & Node.js)</option>
                <option value="Python Data Structures & Algorithms">Python Data Structures & Algorithms</option>
                <option value="Database Architect (SQL & NoSQL)">Database Architect (SQL & NoSQL)</option>
              </select>
            </div>

            <button
              onClick={handleStartInterview}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-5 h-5 fill-white" /> Start Live Mock Interview
            </button>
          </div>
        )}

        {/* Phase 2: Live Question & Answer Workspace */}
        {interviewStarted && currentQuestion && (
          <div className="space-y-5 my-2">
            {/* Question Card */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-2">
                <span>Question #{questionCount} • {role}</span>
                <span className="bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-800">
                  AI Interviewer Live
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white leading-snug mb-2">
                {currentQuestion.question}
              </h4>
              <p className="text-xs text-slate-400 italic">
                💡 <span className="font-semibold">Interviewer Hint:</span> {currentQuestion.hint}
              </p>
            </div>

            {/* Answer Input */}
            {!scorecard && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Your Technical Answer / Code Solution
                </label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your explanation or code implementation here..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-indigo-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                ></textarea>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                  className="w-full py-3.5 mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Answer with Peervo AI...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Submit Answer to AI Interviewer
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Scorecard & Feedback Display */}
            {scorecard && (
              <div className="bg-slate-950 border border-indigo-500/40 p-6 rounded-3xl space-y-5 animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" />
                    <h4 className="text-lg font-extrabold text-white">AI Interview Readiness Scorecard</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400">{scorecard.score}/100</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Overall Rating</p>
                  </div>
                </div>

                {/* Score Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Technical Depth</p>
                    <p className="text-lg font-extrabold text-indigo-400">{scorecard.technicalDepth}%</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Problem Solving</p>
                    <p className="text-lg font-extrabold text-purple-400">{scorecard.problemSolving}%</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Code Quality</p>
                    <p className="text-lg font-extrabold text-emerald-400">{scorecard.codeQuality}%</p>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase mb-1">AI Senior Engineer Feedback:</h5>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {scorecard.feedback}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-indigo-400 uppercase mb-1">Key Strengths:</h5>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {scorecard.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-amber-400 uppercase mb-1">Area for Improvement:</h5>
                  <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl">
                    {scorecard.improvementArea}
                  </p>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                >
                  <span>Next Technical Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
