import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex items-end gap-2 my-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          {message.senderId?.profilePic ? (
            <img
              src={message.senderId.profilePic}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-[10px] flex items-center justify-center">
              {message.senderId?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl shadow-md text-sm leading-relaxed ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
        }`}
      >
        {!isOwn && message.senderId?.name && (
          <span className="block text-[10px] font-bold text-indigo-300 mb-0.5">
            {message.senderId.name}
          </span>
        )}

        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
          <span>{formattedTime}</span>
          {isOwn && (
            <span>
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-cyan-300 inline" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-indigo-200 inline" />
              ) : (
                <Check className="w-3.5 h-3.5 text-indigo-200 inline" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
