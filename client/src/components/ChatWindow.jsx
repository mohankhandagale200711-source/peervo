import React, { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import VideoCallModal from './VideoCallModal';
import AudioCallModal from './AudioCallModal';
import CodePlaygroundModal from './CodePlaygroundModal';
import WhiteboardModal from './WhiteboardModal';
import API from '../services/api';
import { Send, Users, Sparkles, ArrowLeft, Video, Phone, Code2, Palette } from 'lucide-react';

export default function ChatWindow({ activeChat, onBack }) {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isWhiteboardModalOpen, setIsWhiteboardModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const otherUser = activeChat?.isGroup
    ? null
    : activeChat?.participants?.find((p) => p._id !== user?._id);

  const isOtherUserOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/messages/${activeChat._id}`);
        setMessages(res.data);

        if (socket) {
          socket.emit('join_chat', activeChat._id);
          socket.emit('mark_message_read', { chatId: activeChat._id, userId: user._id });
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchMessages();
  }, [activeChat, socket, user]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (data.chat._id === activeChat?._id) {
        setMessages((prev) => [...prev, data.message]);
        socket.emit('mark_message_read', { chatId: activeChat._id, userId: user._id });
      }
    };

    const handleMessageSent = (sentMsg) => {
      if (sentMsg.chatId === activeChat?._id) {
        setMessages((prev) => [...prev, sentMsg]);
      }
    };

    const handleTyping = (room) => {
      if (room === activeChat?._id) setIsTyping(true);
    };

    const handleStopTyping = (room) => {
      if (room === activeChat?._id) setIsTyping(false);
    };

    const handleReadUpdate = ({ chatId }) => {
      if (chatId === activeChat?._id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, status: 'read' }))
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_read_update', handleReadUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_read_update', handleReadUpdate);
    };
  }, [socket, activeChat, user]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    if (socket) {
      socket.emit('send_message', {
        chatId: activeChat._id,
        senderId: user._id,
        text: newMessage,
      });
      socket.emit('stop_typing', activeChat._id);
    }

    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChat) return;

    socket.emit('typing', activeChat._id);
    setTimeout(() => {
      socket.emit('stop_typing', activeChat._id);
    }, 2500);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800 min-h-[400px]">
        <Sparkles className="w-12 h-12 text-indigo-500 mb-3 animate-pulse opacity-80" />
        <h3 className="text-xl font-bold text-white mb-1">Select a Conversation</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Pick a student profile or group team chat from the sidebar to start real-time messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Back to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {activeChat.isGroup ? (
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          ) : otherUser?.profilePic ? (
            <img src={otherUser.profilePic} alt="" className="w-10 h-10 rounded-2xl object-cover border border-indigo-500/40" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              {otherUser?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              {activeChat.isGroup ? activeChat.chatName : otherUser?.name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              {!activeChat.isGroup && (
                <span className={`w-2 h-2 rounded-full ${isOtherUserOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              )}
              {activeChat.isGroup
                ? `${activeChat.participants.length} team members`
                : isOtherUserOnline
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons: Whiteboard, Code Playground, Audio Call, Video Call */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsWhiteboardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition"
            title="Open Collaborative Real-Time Whiteboard Canvas"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Whiteboard</span>
          </button>

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition"
            title="Open Live Code Playground"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <button
            onClick={() => setIsAudioModalOpen(true)}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition"
            title="Start WebRTC Live Audio Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            title="Start WebRTC Live Video Call & Screen Share"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-2 bg-slate-950/40">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            isOwn={(msg.senderId?._id || msg.senderId) === user?._id}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 italic p-2 bg-slate-800/40 rounded-xl w-fit">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
            <span className="ml-1">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2.5 sm:p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition duration-200 shadow-md shadow-indigo-600/30"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Real-Time Collaborative Whiteboard Canvas Modal */}
      <WhiteboardModal
        activeChat={activeChat}
        isOpen={isWhiteboardModalOpen}
        onClose={() => setIsWhiteboardModalOpen(false)}
      />

      {/* WebRTC Live Audio Call Modal */}
      <AudioCallModal
        activeChat={activeChat}
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      {/* WebRTC Live Video Call Modal */}
      <VideoCallModal
        activeChat={activeChat}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* Collaborative Live Code Playground Modal */}
      <CodePlaygroundModal
        activeChat={activeChat}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
