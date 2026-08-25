import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import MockInterviewModal from './MockInterviewModal';
import {
  Compass,
  FileText,
  Bookmark,
  MessageSquare,
  LogOut,
  Upload,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  Bot,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const ownerEmail = 'mohankhandagale200711@gmail.com';
  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === ownerEmail);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 shadow-xl shadow-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition duration-200">
                  <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Peervo
                </span>
                <span className="text-[10px] font-bold text-indigo-400 block -mt-1 tracking-widest uppercase flex items-center gap-1">
                  Student Hub <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
                <Link
                  to="/explore"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 ${
                    isActive('/explore')
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Compass className="w-4 h-4" /> Explore
                </Link>
                <Link
                  to="/notes"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 ${
                    isActive('/notes') || isActive('/upload-note')
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Course Notes
                </Link>
                <Link
                  to="/bookmarks"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 ${
                    isActive('/bookmarks')
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" /> Bookmarks
                </Link>
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 ${
                    isActive('/chat')
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Chat & AI
                </Link>
                <button
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-600/20 transition duration-200 border border-purple-500/30"
                  title="Launch AI Technical Mock Interviewer"
                >
                  <BrainCircuit className="w-4 h-4 text-purple-400" /> Mock Interview
                </button>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition duration-200 ${
                      isActive('/admin')
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
                    }`}
                    title="Admin Analytics Dashboard"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400" /> Admin
                  </Link>
                )}
              </div>
            )}

            {/* Right Action Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/upload-note"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition duration-200"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Note
                  </Link>

                  <NotificationBell />

                  <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800/80">
                    <Link
                      to={`/profile/${user._id}`}
                      className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition duration-200 group/prof"
                    >
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40 group-hover/prof:border-indigo-400 transition"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-xs shadow-md">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="hidden lg:inline font-bold text-xs text-slate-200 group-hover/prof:text-white transition">
                        {user.name}
                      </span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition duration-200"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Hamburger Toggle Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && user && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl">
            <Link
              to={`/profile/${user._id}`}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3"
            >
              {user.profilePic ? (
                <img src={user.profilePic} alt="" className="w-10 h-10 rounded-full object-cover border border-indigo-500/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="font-bold text-white text-sm">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </Link>

            <Link
              to="/explore"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive('/explore') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-5 h-5 text-indigo-400" /> Explore Projects & Students
            </Link>

            <button
              onClick={() => {
                closeMobileMenu();
                setIsInterviewModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-purple-300 hover:bg-slate-900 transition"
            >
              <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Mock Interviewer
            </button>

            <Link
              to="/notes"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive('/notes') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-5 h-5 text-indigo-400" /> Course Notes Hub
            </Link>

            <Link
              to="/upload-note"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive('/upload-note') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Upload className="w-5 h-5 text-indigo-400" /> Upload Study Material
            </Link>

            <Link
              to="/bookmarks"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive('/bookmarks') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-5 h-5 text-indigo-400" /> Saved Items
            </Link>

            <Link
              to="/chat"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive('/chat') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Bot className="w-5 h-5 text-indigo-400" /> Chat & AI Assistant
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                  isActive('/admin') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> Admin Analytics Dashboard
              </Link>
            )}

            <button
              onClick={() => {
                closeMobileMenu();
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition mt-2"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* AI Mock Interviewer Modal */}
      <MockInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
      />
    </>
  );
}
