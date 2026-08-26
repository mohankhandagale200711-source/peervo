import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import ChatWindow from '../components/ChatWindow';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { MessageSquare, Users, Plus, X, Search } from 'lucide-react';

export default function Chat() {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(location.state?.selectedChat || null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile View state: show sidebar list or active conversation
  const [showMobileChatWindow, setShowMobileChatWindow] = useState(Boolean(location.state?.selectedChat));

  // Group Chat modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Handle "Message" button from ProfileCard — create/find chat with specific user
  useEffect(() => {
    const startChatWithUser = location.state?.startChatWithUser;
    if (startChatWithUser && user) {
      const initChat = async () => {
        try {
          const res = await API.post('/chat', { userId: startChatWithUser._id });
          const chat = res.data;
          setActiveChat(chat);
          setShowMobileChatWindow(true);
          // Clear navigation state so it doesn't re-trigger
          window.history.replaceState({}, document.title);
        } catch (err) {
          console.error('Error creating chat with user:', err);
        }
      };
      initChat();
    }
  }, [location.state, user]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/chat');
      setChats(res.data);
      if (!activeChat && !location.state?.startChatWithUser && res.data.length > 0 && window.innerWidth >= 768) {
        setActiveChat(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const openGroupModal = async () => {
    try {
      const res = await API.get('/users/search');
      setAllUsers(res.data.filter((u) => u._id !== user._id));
      setShowGroupModal(true);
    } catch (err) {
      console.error('Failed to load students for group chat:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUserIds.length < 1) return;

    try {
      const res = await API.post('/chat/group', {
        name: groupName,
        users: JSON.stringify(selectedUserIds),
      });

      setChats([res.data, ...chats]);
      setActiveChat(res.data);
      setShowMobileChatWindow(true);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedUserIds([]);
    } catch (err) {
      console.error('Error creating group chat:', err);
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setShowMobileChatWindow(true);
  };

  const filteredChats = chats.filter((c) => {
    if (c.isGroup) return c.chatName.toLowerCase().includes(searchQuery.toLowerCase());
    const other = c.participants.find((p) => p._id !== user._id);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 h-[calc(100dvh-8rem)] md:h-[calc(100dvh-5rem)] overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Sidebar: Chats List (Hidden on mobile if viewing an active chat) */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl ${
          showMobileChatWindow ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 mb-4 px-2">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Messages
          </h2>

          <button
            onClick={openGroupModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition"
            title="Create Team Group Chat"
          >
            <Users className="w-3.5 h-3.5" /> + Group
          </button>
        </div>

        {/* Search Chat */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Chats Feed */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No conversations yet.</div>
          ) : (
            filteredChats.map((chat) => {
              const other = chat.isGroup
                ? null
                : chat.participants.find((p) => p._id !== user._id);
              const isOnline = other ? onlineUsers.includes(other._id) : false;
              const isActive = activeChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {chat.isGroup ? (
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : other?.profilePic ? (
                      <img src={other.profilePic} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm">
                        {other?.name?.charAt(0) || 'U'}
                      </div>
                    )}

                    {!chat.isGroup && (
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                      ></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-sm truncate text-white">
                        {chat.isGroup ? chat.chatName : other?.name}
                      </h4>
                      {chat.updatedAt && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {chat.lastMessage ? chat.lastMessage.text : 'Started a conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window (Hidden on mobile when list is displayed) */}
      <div className={`flex-1 min-h-0 ${!showMobileChatWindow ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow
          activeChat={activeChat}
          onBack={() => setShowMobileChatWindow(false)}
        />
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGroupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-4">Create Team Group Chat</h3>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Group / Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Capstone Web Team 4"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Select Teammates *
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {allUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleUserSelection(u._id)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${
                          isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-semibold">{u.name} ({u.email})</span>
                        {isSelected && <span className="font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!groupName || selectedUserIds.length < 1}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Create Group Chat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
