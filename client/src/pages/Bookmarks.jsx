import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProjectCard from '../components/ProjectCard';
import NoteCard from '../components/NoteCard';
import { Bookmark, FolderGit2, FileText } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'project' | 'note'

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookmarks');
      setBookmarks(res.data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filterType === 'all') return true;
    return b.itemType === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-indigo-400 fill-indigo-400/20" /> Saved Items
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quick access to bookmarked project showcases and study course notes.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({bookmarks.length})
          </button>
          <button
            onClick={() => setFilterType('project')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'project'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Projects
          </button>
          <button
            onClick={() => setFilterType('note')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'note'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Notes
          </button>
        </div>
      </div>

      {/* Grid of Bookmarks */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading saved items...</div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-slate-300">No Saved Items Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click the bookmark icon on any project or course note to save it here for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => {
            if (!bookmark.itemId) return null;
            if (bookmark.itemType === 'project') {
              return (
                <ProjectCard
                  key={bookmark._id}
                  project={bookmark.itemId}
                  isBookmarked={true}
                  onUpdate={fetchBookmarks}
                />
              );
            } else {
              return (
                <NoteCard
                  key={bookmark._id}
                  note={bookmark.itemId}
                  isBookmarked={true}
                  onUpdate={fetchBookmarks}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
