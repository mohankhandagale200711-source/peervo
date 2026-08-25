import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { Users, FolderGit2, FileText, MessageSquare, ShieldCheck, Trash2, RefreshCw, Sparkles, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { onlineUsers } = useContext(SocketContext);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setStudents(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteStudent = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete student account "${userName}" and all their data?`)) return;
    try {
      await API.delete(`/admin/user/${userId}`);
      setStudents(students.filter((s) => s._id !== userId));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <span>Loading Admin Analytics Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Admin & System Analytics Dashboard
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Live platform metrics, user management, and cloud database stats
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Students */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Students</p>
            <h3 className="text-3xl font-extrabold text-white">{stats?.totalUsers || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Online Students */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Currently Online</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 flex items-center gap-2">
              {onlineUsers.length}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Projects Showcased */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Projects Showcased</p>
            <h3 className="text-3xl font-extrabold text-white">{stats?.totalProjects || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        {/* Course Study Notes */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Study Notes Shared</p>
            <h3 className="text-3xl font-extrabold text-white">{stats?.totalNotes || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Student Directory & Moderation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white tracking-tight">Student Directory & Moderation</h3>
          <span className="text-xs text-slate-400 font-mono">Total Users: {students.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Student Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Education / Degree</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {students.map((student) => {
                const isOnline = onlineUsers.includes(student._id);
                return (
                  <tr key={student._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 flex items-center gap-2.5 font-bold text-white">
                      {student.profilePic ? (
                        <img src={student.profilePic} alt="" className="w-7 h-7 rounded-full object-cover border border-indigo-500/40" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {student.name?.charAt(0)}
                        </div>
                      )}
                      <span>{student.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{student.email}</td>
                    <td className="p-3.5 text-slate-400">{student.education || 'Student'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isOnline ? '● Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Student Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
