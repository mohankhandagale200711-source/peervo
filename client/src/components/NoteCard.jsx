import React, { useState, useContext } from 'react';
import { FileText, Download, Bookmark, Sparkles, User as UserIcon, Tag, ThumbsUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function NoteCard({ note, isBookmarked: initialBookmarked = false, onDownload }) {
  const { user } = useContext(AuthContext);
  const [downloads, setDownloads] = useState(note.downloads || 0);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleDownload = async () => {
    try {
      setDownloads((prev) => prev + 1);
      await API.put(`/notes/${note._id}/download`);
      if (onDownload) onDownload(note._id);
      window.open(note.fileUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      if (bookmarked) {
        await API.delete(`/bookmarks/${note._id}`);
        setBookmarked(false);
      } else {
        await API.post('/bookmarks', { itemType: 'note', itemId: note._id });
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 flex flex-col justify-between group">
      <div>
        {/* Course Badge & File Type Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-extrabold tracking-wide px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-indigo-400" /> {note.course}
          </span>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {note.fileType || 'PDF'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-indigo-400 transition tracking-tight line-clamp-2">
          {note.title}
        </h3>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-400" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
        {/* Uploader Details */}
        <div className="flex items-center gap-2">
          {note.uploadedBy && typeof note.uploadedBy === 'object' ? (
            <div className="flex items-center gap-2">
              {note.uploadedBy.profilePic ? (
                <img src={note.uploadedBy.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-indigo-500/40" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {note.uploadedBy.name?.charAt(0)}
                </div>
              )}
              <span className="text-xs text-slate-300 font-semibold">{note.uploadedBy.name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Student Contributor</span>
          )}
        </div>

        {/* Bookmark & Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition ${
              bookmarked ? 'text-indigo-400 bg-indigo-950 border border-indigo-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Save Note'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-400' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition transform hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloads} Downloads</span>
          </button>
        </div>
      </div>
    </div>
  );
}
