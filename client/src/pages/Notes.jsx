import React, { useState, useEffect } from 'react';
import API from '../services/api';
import NoteCard from '../components/NoteCard';
import AdBanner from '../components/AdBanner';
import { Search, FileText, Upload, Sparkles, Filter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');

  const courses = [
    'All',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Web Development',
    'Artificial Intelligence',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
  ];

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = '/notes/search';
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCourse !== 'All') params.append('course', selectedCourse);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, selectedCourse]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Centralized Academic Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Course Notes & Exam Guides. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Shared by Top Students.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            Access verified lecture notes, revision PDFs, and past exam guides uploaded by senior students across computer science courses.
          </p>

          <Link
            to="/upload-note"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" /> Upload Study Material
          </Link>
        </div>
      </div>

      {/* Ad Banner Space */}
      <AdBanner slot="notes-top" />

      {/* Search & Course Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, course, or tags (e.g. Normalization, 3NF)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xl transition backdrop-blur-xl"
          />
        </div>

        {/* Horizontal Course Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {courses.map((course) => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedCourse === course
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <span>Loading course notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-slate-300">No Course Notes Found</h3>
          <p className="text-xs text-slate-500 mt-1">Be the first student to upload notes for this course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
