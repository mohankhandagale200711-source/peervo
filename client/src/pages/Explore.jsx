import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProfileCard from '../components/ProfileCard';
import AdBanner from '../components/AdBanner';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus, Flame, Sparkles, Users, FolderGit2, X, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Explore() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'students'
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByTrending, setSortByTrending] = useState(false);

  // New Project Modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    liveLink: '',
  });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      let url = '/projects';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (sortByTrending) params.append('sort', 'trending');
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      let url = '/users/search';
      if (searchQuery) url += `?query=${encodeURIComponent(searchQuery)}`;
      const res = await API.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'projects') {
      fetchProjects().finally(() => setLoading(false));
    } else {
      fetchStudents().finally(() => setLoading(false));
    }
  }, [activeTab, searchQuery, sortByTrending]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('techStack', newProject.techStack);
      formData.append('githubLink', newProject.githubLink);
      formData.append('liveLink', newProject.liveLink);
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await API.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProjects([res.data, ...projects]);
      setShowProjectModal(false);
      setNewProject({ title: '', description: '', techStack: '', githubLink: '', liveLink: '' });
      setScreenshotFile(null);
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Student Collaboration & Portfolio Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Empower Your Portfolio. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Collaborate & Showcase Your Work.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-7 max-w-2xl">
            Explore peer project showcases, share course study notes, and chat in real-time with fellow students and 24/7 AI Assistants.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" /> Showcase Your Project
              </button>
            )}

            <Link
              to="/chat"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition"
            >
              <Bot className="w-4 h-4 text-indigo-400" /> Chat with Peervo AI
            </Link>
          </div>
        </div>

        {/* Stats Bar Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">50+ Showcases</p>
              <p className="text-[11px] text-slate-400 font-medium">Real Student Work</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">100% Verified</p>
              <p className="text-[11px] text-slate-400 font-medium">Student Profiles</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">Real-Time Chat</p>
              <p className="text-[11px] text-slate-400 font-medium">Synced Cloud DB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner Space */}
      <AdBanner slot="explore-top" />

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl shadow-xl backdrop-blur-xl">
        {/* Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-extrabold transition ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" /> Projects Showcase
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-extrabold transition ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Student Directory
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'projects' ? 'Search title, tech stack...' : 'Search name, skills...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Trending Filter */}
        {activeTab === 'projects' && (
          <button
            onClick={() => setSortByTrending(!sortByTrending)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
              sortByTrending
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${sortByTrending ? 'text-amber-400 fill-amber-400 animate-pulse' : ''}`} />
            <span>Trending</span>
          </button>
        )}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <span>Loading showcase items...</span>
        </div>
      ) : activeTab === 'projects' ? (
        projects.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first student to showcase a project on Peervo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )
      ) : students.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-slate-300">No Students Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching with a different name or skill query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {students.map((student) => (
            <ProfileCard key={student._id} student={student} />
          ))}
        </div>
      )}

      {/* Modal: Create Project Showcase */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowProjectModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">Showcase New Project</h3>
            <p className="text-xs text-slate-400 mb-6">Add your repository details and live demo links.</p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Weather Dashboard App"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Briefly describe what your app does..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  placeholder="React, Node.js, Socket.IO, MongoDB"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    GitHub Repo Link
                  </label>
                  <input
                    type="url"
                    value={newProject.githubLink}
                    onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                    placeholder="https://github.com/user/repo"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={newProject.liveLink}
                    onChange={(e) => setNewProject({ ...newProject, liveLink: e.target.value })}
                    placeholder="https://myproject.vercel.app"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Screenshot Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshotFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={modalSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition mt-2"
              >
                {modalSubmitting ? 'Publishing...' : 'Publish Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
