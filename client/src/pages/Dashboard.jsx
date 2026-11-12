import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getMediaUrl } from '../utils/urlHelper';
import { AuthContext } from '../context/AuthContext';
import {
  Sparkles,
  FolderGit2,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  Star,
  GitBranch,
  Terminal,
  Cpu,
  BookOpen,
  Users,
  Bot,
  Layers,
  Search,
  Compass,
  Bookmark,
  ShieldCheck,
  TrendingUp,
  Code2,
  Activity,
  Flame,
  Plus,
  ExternalLink,
  Command,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  GraduationCap,
  Award,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteCategory, setSelectedNoteCategory] = useState('All');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, noteRes, studRes] = await Promise.allSettled([
          API.get('/projects?sort=trending'),
          API.get('/notes/search?sort=trending'),
          API.get('/users/search'),
        ]);

        if (projRes.status === 'fulfilled') setProjects(projRes.value.data.slice(0, 6));
        if (noteRes.status === 'fulfilled') setNotes(noteRes.value.data.slice(0, 6));
        if (studRes.status === 'fulfilled') {
          setStudents(
            studRes.value.data
              .filter((s) => s._id !== user?._id && s.email !== 'ai@peervo.bot')
              .slice(0, 5)
          );
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?._id]);

  const categories = ['All', 'Computer Science', 'Data Structures', 'AI / ML', 'Systems', 'Mathematics'];

  const filteredNotes = selectedNoteCategory === 'All'
    ? notes
    : notes.filter(n =>
        n.course?.toLowerCase().includes(selectedNoteCategory.toLowerCase()) ||
        n.title?.toLowerCase().includes(selectedNoteCategory.toLowerCase()) ||
        n.tags?.some(t => t.toLowerCase().includes(selectedNoteCategory.toLowerCase()))
      );

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Ambient Glows - Apple / Neon Aesthetic */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />

      {/* Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* BENTO CARD 1: HERO PORTFOLIO SPOTLIGHT (Spans 8 cols) */}
          <div className="md:col-span-8 rounded-3xl bg-slate-900/30 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden group hover:border-cyan-500/30 transition duration-500 flex flex-col justify-between shadow-2xl">
            {/* Neon Glow Corner */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>STUDENT ENGINEERING PORTFOLIO</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                  <span>v2026.04 • Verified Node</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Architect. Collaborate.{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Build the Future.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mb-6 font-normal">
                Peervo empowers computer science and engineering scholars to publish peer-reviewed project repositories, exchange LaTeX & markdown course notes, and run synchronous pair-programming with AI agents.
              </p>

              {/* Dynamic Project Quick Widgets Carousel / Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-2">
                {projects.slice(0, 2).map((proj) => (
                  <div
                    key={proj._id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.07] hover:border-cyan-500/40 transition group/proj"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                        {Array.isArray(proj.techStack)
                          ? (proj.techStack[0] || 'Engineering')
                          : (typeof proj.techStack === 'string' && proj.techStack.trim()
                              ? proj.techStack.split(',')[0].trim()
                              : 'Engineering')}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{proj.likedBy?.length || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover/proj:text-cyan-300 transition truncate">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        By {proj.owner?.name || 'Peer Scholar'}
                      </span>
                      <Link
                        to="/explore"
                        className="text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover/proj:translate-x-0.5 transition"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-5 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <strong>99.8%</strong> Peer Review Rate
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <strong>24/7</strong> AI Compiler Assist
                </span>
              </div>
              <Link
                to="/explore"
                className="text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1 group"
              >
                Browse All 50+ Verified Portfolios
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* BENTO CARD 2: 24/7 PEERVO AI KNOWLEDGE ENGINE (Spans 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-gradient-to-b from-purple-950/30 via-slate-900/40 to-slate-950/60 backdrop-blur-2xl border border-purple-500/20 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-purple-500/40 transition duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                  Gemini Flash AI
                </span>
              </div>

              <h3 className="text-lg font-black text-white tracking-tight mb-2">
                Real-Time AI Academic Mentor
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Trained for computational theory, algorithm proofs, system design patterns, and code debugging.
              </p>

              {/* Sample AI capabilities pills */}
              <div className="space-y-2 mb-4">
                {[
                  'Explain Dijkstra vs A* Search complexity',
                  'Debug React state synchronization race',
                  'Synthesize LaTeX equations from notes',
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate('/chat', { state: { prefillPrompt: item } })}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-purple-950/40 border border-white/[0.06] hover:border-purple-500/30 text-xs text-slate-300 transition flex items-center justify-between group/prompt"
                  >
                    <span className="truncate pr-2 font-mono text-[11px]">{item}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 group-hover/prompt:translate-x-0.5 transition flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/chat"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open AI Copilot Chat</span>
            </Link>
          </div>

          {/* BENTO CARD 3: CATEGORIZED MARKDOWN STUDY NOTES (Spans 7 cols) */}
          <div className="md:col-span-7 rounded-3xl bg-slate-900/30 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-7 relative overflow-hidden group hover:border-cyan-500/30 transition duration-500 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Curated Academic Markdown Notes
                    </h3>
                    <p className="text-[11px] text-slate-400">Peer-reviewed lecture summaries & problem sets</p>
                  </div>
                </div>

                <Link
                  to="/upload-note"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-white/[0.08] transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish Note
                </Link>
              </div>

              {/* Note Category Filters */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedNoteCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
                      selectedNoteCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-white/[0.05]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Notes List with Markdown preview aesthetic */}
              <div className="space-y-2.5">
                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No notes found in this category. Click "Publish Note" to contribute!
                  </div>
                ) : (
                  filteredNotes.slice(0, 3).map((note) => (
                    <div
                      key={note._id}
                      className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] hover:border-cyan-500/30 transition group/note flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-cyan-400 font-mono text-xs flex-shrink-0">
                          MD
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover/note:text-cyan-300 transition">
                            {note.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                              {note.course || 'GENERAL'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {note.uploadedBy?.name || 'Scholar'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {note.likedBy?.length || 0}
                        </span>
                        <Link
                          to="/notes"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
              <span>Markdown • PDF • LaTeX syntax supported</span>
              <Link to="/notes" className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
                View all notes library <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* BENTO CARD 4: ACTIVE PEER NETWORK & CODING PODS (Spans 5 cols) */}
          <div className="md:col-span-5 rounded-3xl bg-slate-900/30 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-7 relative overflow-hidden group hover:border-purple-500/30 transition duration-500 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Active Peer Collaborators</h3>
                    <p className="text-[11px] text-slate-400">Connect, review code, or start study pod</p>
                  </div>
                </div>
              </div>

              {/* Peer Cards */}
              <div className="space-y-2.5">
                {students.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No active students online right now.
                  </div>
                ) : (
                  students.map((stud) => (
                    <div
                      key={stud._id}
                      className="p-3 rounded-2xl bg-slate-950/50 border border-white/[0.06] hover:border-purple-500/30 transition flex items-center justify-between gap-3 group/peer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {stud.profilePic ? (
                          <img
                            src={getMediaUrl(stud.profilePic)}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover border border-purple-500/20 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                            {stud.name?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-peer:text-purple-300">
                            {stud.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {stud.skills?.length > 0 ? stud.skills.slice(0, 3).join(' • ') : 'Computer Science'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link
                          to="/chat"
                          state={{ startChatWithUser: stud }}
                          className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-bold border border-purple-500/30 transition"
                        >
                          Message
                        </Link>
                        <Link
                          to={`/profile/${stud._id}`}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                          title="View Portfolio"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Syncing live via Socket.IO</span>
              <Link to="/explore" className="text-purple-400 font-bold hover:underline flex items-center gap-1">
                Explore all students <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
