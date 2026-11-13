const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getAiAnswer } = require('../services/aiKnowledgeEngine');
const { COOKIE_NAME, readCookie } = require('../utils/sessionCookie');

const onlineUsers = new Map(); // userId -> Set(socketId)

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, COOKIE_NAME);
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email');
      if (!user) return next(new Error('Authentication required'));

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(userId);

    const userSockets = onlineUsers.get(userId) || new Set();
    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);
    io.emit('online_users', Array.from(onlineUsers.keys()));

    const getChatForUser = async (chatId) => {
      try {
        if (!chatId) return null;
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.some((participant) => participant.toString() === userId)) return null;
        return chat;
      } catch {
        return null;
      }
    };

    const relayCall = async (payload, event, audio = false) => {
      const { chatId, to, userToCall, signalData, signal, candidate } = payload || {};
      const targetId = (to || userToCall || '').toString();
      const chat = await getChatForUser(chatId);
      if (!chat || !chat.participants.some((participant) => participant.toString() === targetId)) return;

      let eventName = event;
      let data;
      if (event === 'call_user' || event === 'call_user_audio') {
        eventName = audio ? 'call_incoming_audio' : 'call_incoming';
        data = { signal: signalData, from: userId, name: socket.user.name, chatId };
      } else if (event === 'answer_call' || event === 'answer_call_audio') {
        eventName = audio ? 'call_accepted_audio' : 'call_accepted';
        data = signal;
      } else if (event === 'ice_candidate' || event === 'ice_candidate_audio') {
        data = candidate;
      } else {
        eventName = audio ? 'call_ended_audio' : 'call_ended';
        data = { chatId };
      }
      io.to(targetId).emit(eventName, data);
    };

    socket.on('join_chat', async (chatId) => {
      try {
        if (await getChatForUser(chatId)) socket.join(chatId.toString());
      } catch (err) {
        console.error('Socket join_chat failed:', err.message);
      }
    });

    socket.on('typing', async (chatId) => {
      if (await getChatForUser(chatId)) socket.to(chatId.toString()).emit('typing', chatId.toString());
    });
    socket.on('stop_typing', async (chatId) => {
      if (await getChatForUser(chatId)) socket.to(chatId.toString()).emit('stop_typing', chatId.toString());
    });

    socket.on('call_user', (payload) => relayCall(payload, 'call_user').catch(() => {}));
    socket.on('answer_call', (payload) => relayCall(payload, 'answer_call').catch(() => {}));
    socket.on('ice_candidate', (payload) => relayCall(payload, 'ice_candidate').catch(() => {}));
    socket.on('end_call', (payload) => relayCall(payload, 'end_call').catch(() => {}));
    socket.on('call_user_audio', (payload) => relayCall(payload, 'call_user_audio', true).catch(() => {}));
    socket.on('answer_call_audio', (payload) => relayCall(payload, 'answer_call_audio', true).catch(() => {}));
    socket.on('ice_candidate_audio', (payload) => relayCall(payload, 'ice_candidate_audio', true).catch(() => {}));
    socket.on('end_call_audio', (payload) => relayCall(payload, 'end_call_audio', true).catch(() => {}));

    socket.on('code_change', async (payload = {}) => {
      const { chatId, code, language } = payload || {};
      if (await getChatForUser(chatId)) {
        socket.to(chatId.toString()).emit('code_sync', { code, language, senderId: userId });
      }
    });
    socket.on('code_run', async (payload = {}) => {
      const { chatId, output, code, language } = payload || {};
      if (await getChatForUser(chatId)) {
        socket.to(chatId.toString()).emit('code_run_sync', { output, code, language, senderId: userId });
      }
    });
    socket.on('whiteboard_draw', async (payload = {}) => {
      const data = payload || {};
      if (await getChatForUser(data.chatId)) {
        socket.to(data.chatId.toString()).emit('whiteboard_draw', { ...data, senderId: userId });
      }
    });
    socket.on('whiteboard_clear', async (payload = {}) => {
      const data = payload || {};
      if (await getChatForUser(data.chatId)) {
        socket.to(data.chatId.toString()).emit('whiteboard_clear', { chatId: data.chatId, senderId: userId });
      }
    });

    socket.on('send_message', async (payload = {}) => {
      const { chatId, text } = payload || {};
      if (typeof text !== 'string' || !text.trim() || text.length > 10000) return;
      try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat || !chat.participants.some((participant) => participant._id.toString() === userId)) return;

        let message = await Message.create({
          chatId,
          senderId: userId,
          text: text.trim(),
          status: 'delivered',
        });
        message = await message.populate('senderId', 'name profilePic email');
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
        socket.emit('message_sent', message);

        const aiParticipant = chat.participants.find((participant) => participant.email === 'ai@peervo.bot');
        if (aiParticipant) {
          io.to(userId).emit('typing', chatId.toString());
          const aiReplyText = await getAiAnswer(text.trim());
          let aiMessage = await Message.create({
            chatId,
            senderId: aiParticipant._id,
            text: aiReplyText,
            status: 'read',
          });
          aiMessage = await aiMessage.populate('senderId', 'name profilePic email');
          await Chat.findByIdAndUpdate(chatId, { lastMessage: aiMessage._id });
          io.to(userId).emit('stop_typing', chatId.toString());
          io.to(chatId.toString()).emit('stop_typing', chatId.toString());
          io.to(chatId.toString()).emit('receive_message', { message: aiMessage, chat });
          io.to(userId).emit('receive_message', { message: aiMessage, chat });
          return;
        }

        io.to(chatId.toString()).emit('receive_message', { message, chat });
        const roomSockets = await io.in(chatId.toString()).fetchSockets();
        const activeUsers = new Set(roomSockets.map((connected) => connected.userId));
        for (const participant of chat.participants) {
          const participantId = participant._id.toString();
          if (participantId === userId) continue;

          io.to(participantId).emit('receive_message', { message, chat });
          if (!activeUsers.has(participantId)) {
            const notification = await Notification.create({
              userId: participantId,
              type: 'message',
              fromUser: userId,
              itemRef: { itemType: 'chat', itemId: chatId },
            });
            const populated = await Notification.findById(notification._id).populate('fromUser', 'name profilePic');
            io.to(participantId).emit('notification_received', populated);
          }
        }
      } catch (err) {
        console.error('Error handling send_message:', err.message);
      }
    });

    socket.on('mark_message_read', async (payload = {}) => {
      const { chatId } = payload || {};
      try {
        if (!(await getChatForUser(chatId))) return;
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, status: { $ne: 'read' } },
          { $set: { status: 'read' } }
        );
        await Notification.updateMany(
          { userId, 'itemRef.itemId': chatId, read: false },
          { $set: { read: true } }
        );
        io.to(userId).emit('notifications_updated');
        io.to(chatId.toString()).emit('message_read_update', { chatId, userId });
      } catch (err) {
        console.error('Error marking messages read:', err.message);
      }
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = socketHandler;
