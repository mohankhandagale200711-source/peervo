import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, MessageSquare, ShieldCheck } from 'lucide-react';
import { getMediaUrl } from '../utils/urlHelper';

export default function ProfileCard({ student }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMessage = () => {
    if (!user) return navigate('/login');
    // Pass the friend's info to Chat page — let Chat page create/find the chat
    navigate('/chat', { state: { startChatWithUser: student } });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
      {/* Student Details */}
      <div className="flex items-start gap-4">
        <div
          className="relative cursor-pointer"
          onClick={() => navigate(`/profile/${student._id}`)}
        >
          {student.profilePic ? (
            <img
              src={getMediaUrl(student.profilePic)}
              alt=""
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500/40 group-hover:border-indigo-400 transition"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg">
              {student.name?.charAt(0) || 'U'}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate(`/profile/${student._id}`)}
              className="text-lg font-extrabold text-white hover:text-indigo-400 transition tracking-tight"
            >
              {student.name}
            </button>
            <ShieldCheck className="w-4 h-4 text-indigo-400" title="Verified Student" />
          </div>

          {student.education && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> {student.education}
            </p>
          )}

          {student.bio && (
            <p className="text-xs text-slate-300 line-clamp-2 max-w-lg mb-3">
              {student.bio}
            </p>
          )}

          {student.skills && student.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => navigate(`/profile/${student._id}`)}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition text-center"
        >
          View Profile
        </button>
        <button
          onClick={handleMessage}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition text-center flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Message
        </button>
      </div>
    </div>
  );
}
