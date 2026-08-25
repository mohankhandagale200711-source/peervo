import React, { useState, useContext, useRef, useEffect } from 'react';
import { Bell, Star, MessageSquare, CheckCheck, FileText, FolderGit2 } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    setIsOpen(false);
    if (notif.type === 'message') {
      navigate('/chat');
    } else if (notif.itemRef?.itemType === 'project') {
      navigate(`/explore?project=${notif.itemRef.itemId}`);
    } else if (notif.itemRef?.itemType === 'note') {
      navigate('/notes');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition duration-150 ${
                    n.read ? 'bg-slate-900/40 hover:bg-slate-850' : 'bg-slate-800/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    {n.fromUser?.profilePic ? (
                      <img
                        src={n.fromUser.profilePic}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                        {n.fromUser?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                      {n.type === 'star' ? (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ) : n.type === 'message' ? (
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200">
                      <span className="font-semibold text-white">{n.fromUser?.name || 'Someone'}</span>{' '}
                      {n.type === 'star'
                        ? `starred your ${n.itemRef?.itemType || 'item'}`
                        : n.type === 'message'
                        ? 'sent you a new message'
                        : 'commented on your item'}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
