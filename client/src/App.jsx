import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Notes from './pages/Notes';
import UploadNote from './pages/UploadNote';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8 text-center text-slate-400">Loading Peervo...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8 text-center text-slate-400">Loading Peervo...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/explore" replace />;
  return children;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <Router>
              <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
                <Navbar />
                <main className="page-shell flex-1 pb-16 md:pb-0">
                  <Routes>
                    <Route path="/" element={<Navigate to="/explore" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route
                      path="/explore"
                      element={
                        <ProtectedRoute>
                          <Explore />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notes"
                      element={
                        <ProtectedRoute>
                          <Notes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/upload-note"
                      element={
                        <ProtectedRoute>
                          <UploadNote />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bookmarks"
                      element={
                        <ProtectedRoute>
                          <Bookmarks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:id?"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </Router>
          )}
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
