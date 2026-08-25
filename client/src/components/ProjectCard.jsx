import React, { useState, useContext } from 'react';
import { Star, Bookmark, ExternalLink, Github, Code2, Trash2, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, onUpdate, isBookmarked: initialBookmarked = false, onDelete }) {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(
    project.likedBy ? project.likedBy.some(id => (typeof id === 'string' ? id : id._id || id) === user?._id) : false
  );
  const [starCount, setStarCount] = useState(project.likedBy ? project.likedBy.length : 0);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleStar = async () => {
    if (!user) return;
    try {
      setLiked(!liked);
      setStarCount((prev) => (liked ? prev - 1 : prev + 1));
      const res = await API.put(`/projects/${project._id}/star`);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      console.error('Failed to star project:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      if (bookmarked) {
        await API.delete(`/bookmarks/${project._id}`);
        setBookmarked(false);
      } else {
        await API.post('/bookmarks', { itemType: 'project', itemId: project._id });
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark action failed:', err);
    }
  };

  const isOwner = user && project.owner && (project.owner._id || project.owner) === user._id;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 flex flex-col group">
      {/* Screenshot / Header Banner */}
      {project.screenshot ? (
        <div className="relative h-48 overflow-hidden bg-slate-950">
          <img
            src={project.screenshot}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 p-6 flex items-center justify-between border-b border-slate-800/80 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
          <Code2 className="w-10 h-10 text-indigo-400 opacity-70" />
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-300 uppercase bg-indigo-950/90 px-3 py-1 rounded-full border border-indigo-800/60 shadow-inner flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Project Showcase
          </span>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Owner Details */}
          {project.owner && typeof project.owner === 'object' && (
            <div className="flex items-center gap-2 mb-3">
              <Link to={`/profile/${project.owner._id}`} className="flex items-center gap-2 group/owner">
                {project.owner.profilePic ? (
                  <img src={project.owner.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-indigo-500/40" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {project.owner.name?.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-slate-300 font-semibold group-hover/owner:text-indigo-400 transition">
                  {project.owner.name}
                </span>
              </Link>
            </div>
          )}

          <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-indigo-400 transition tracking-tight">
            {project.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
            {project.description}
          </p>

          {/* Tech Stack Badges */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm"
                title="GitHub Repo"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-indigo-950/80 text-indigo-300 hover:text-white hover:bg-indigo-600 transition shadow-sm"
                title="Live Demo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(project._id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition ${
                bookmarked ? 'text-indigo-400 bg-indigo-950 border border-indigo-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Save Project'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-400' : ''}`} />
            </button>

            <button
              onClick={handleStar}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                liked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-amber-500/10'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${liked ? 'fill-amber-400 text-amber-400 animate-pulse' : ''}`} />
              <span>{starCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
