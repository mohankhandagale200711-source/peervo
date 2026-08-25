import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import ProfileCard from '../components/ProfileCard';
import ProjectCard from '../components/ProjectCard';
import NoteCard from '../components/NoteCard';
import { AuthContext } from '../context/AuthContext';
import { FolderGit2, FileText, X, Save } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useContext(AuthContext);
  const profileId = id || user?._id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    education: '',
    skills: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const res = await API.get(`/users/${profileId}`);
      setStudent(res.data);
      if (user && user._id === profileId) {
        setEditForm({
          name: res.data.name || '',
          bio: res.data.bio || '',
          education: res.data.education || '',
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
      formData.append('education', editForm.education);
      formData.append('skills', editForm.skills);
      if (avatarFile) {
        formData.append('profilePic', avatarFile);
      }

      const res = await API.put(`/users/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      setStudent((prev) => ({ ...prev, ...res.data }));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading student profile...</div>;
  }

  if (!student) {
    return <div className="py-20 text-center text-rose-400 font-semibold">Student profile not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Banner Header */}
      <ProfileCard student={student} onEditClick={() => setShowEditModal(true)} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition ${
            activeTab === 'projects'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" /> Projects ({student.projects?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Course Notes ({student.notes?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' ? (
        student.projects && student.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {student.projects.map((p) => (
              <ProjectCard key={p._id} project={{ ...p, owner: student }} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
            <p className="text-sm text-slate-400">No showcase projects posted yet.</p>
          </div>
        )
      ) : student.notes && student.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {student.notes.map((n) => (
            <NoteCard key={n._id} note={{ ...n, uploadedBy: student }} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No course notes uploaded yet.</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-4">Edit Profile</h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Education / Degree
                </label>
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, Node.js, Python, Java"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Profile Picture Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
