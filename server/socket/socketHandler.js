const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getAiAnswer } = require('../services/aiKnowledgeEngine');

let onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Setup user connection & emit online status
    socket.on('setup', (userData) => {
      if (userData && userData._id) {
        socket.userId = userData._id;
        socket.join(userData._id);
        onlineUsers.set(userData._id.toString(), socket.id);
        
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });

    // Join specific Chat Room
    socket.on('join_chat', (room) => {
      socket.join(room);
    });

    // Handle typing indicators
    socket.on('typing', (room) => socket.in(room).emit('typing', room));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing', room));

    // --- WebRTC Live Video Call Signaling ---
    socket.on('call_user', ({ userToCall, signalData, from, name, chatId }) => {
      io.to(userToCall).emit('call_incoming', {
        signal: signalData,
        from,
        name,
        chatId,
      });
    });

    socket.on('answer_call', ({ to, signal }) => {
      io.to(to).emit('call_accepted', signal);
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      io.to(to).emit('ice_candidate', candidate);
    });

    socket.on('end_call', ({ to, chatId }) => {
      if (to) io.to(to).emit('call_ended', { chatId });
      if (chatId) socket.in(chatId).emit('call_ended', { chatId });
    });

    // --- WebRTC Live Audio Call Signaling ---
    socket.on('call_user_audio', ({ userToCall, signalData, from, name, chatId }) => {
      io.to(userToCall).emit('call_incoming_audio', {
        signal: signalData,
        from,
        name,
        chatId,
      });
    });

    socket.on('answer_call_audio', ({ to, signal }) => {
      io.to(to).emit('call_accepted_audio', signal);
    });

    socket.on('ice_candidate_audio', ({ to, candidate }) => {
      io.to(to).emit('ice_candidate_audio', candidate);
    });

    socket.on('end_call_audio', ({ to, chatId }) => {
      if (to) io.to(to).emit('call_ended_audio', { chatId });
      if (chatId) socket.in(chatId).emit('call_ended_audio', { chatId });
    });

    // --- Collaborative Code Playground Real-Time Sync ---
    socket.on('code_change', ({ chatId, code, language, senderId }) => {
      socket.in(chatId).emit('code_sync', { code, language, senderId });
    });

    socket.on('code_run', ({ chatId, output, code, language, senderId }) => {
      socket.in(chatId).emit('code_run_sync', { output, code, language, senderId });
    });

    // --- Collaborative Real-Time Whiteboard Sync ---
    socket.on('whiteboard_draw', (data) => {
      if (data.chatId) {
        socket.in(data.chatId).emit('whiteboard_draw', data);
      }
    });

    socket.on('whiteboard_clear', (data) => {
      if (data.chatId) {
        socket.in(data.chatId).emit('whiteboard_clear', data);
      }
    });

    // Real-time Send Message
    socket.on('send_message', async (newMessageData) => {
      const { chatId, senderId, text } = newMessageData;
      if (!chatId || !senderId || !text) return;

      try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) return;

        let message = await Message.create({
          chatId,
          senderId,
          text,
          status: 'delivered',
        });

        message = await message.populate('senderId', 'name profilePic email');

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        // Send back created message to sender
        socket.emit('message_sent', message);

        // Check if message is sent to Peervo AI Assistant
        const aiParticipant = chat.participants.find((p) => p.email === 'ai@peervo.bot');

        if (aiParticipant && senderId.toString() !== aiParticipant._id.toString()) {
          // Trigger AI typing status
          io.to(senderId.toString()).emit('typing', chatId);

          // Get Peervo AI response asynchronously
          const aiReplyText = await getAiAnswer(text);

          // Create AI response message
          let aiMessage = await Message.create({
            chatId,
            senderId: aiParticipant._id,
            text: aiReplyText,
            status: 'read',
          });

          aiMessage = await aiMessage.populate('senderId', 'name profilePic email');
          await Chat.findByIdAndUpdate(chatId, { lastMessage: aiMessage._id });

          // Stop AI typing status
          io.to(chatId.toString()).emit('stop_typing', chatId);
          io.to(senderId.toString()).emit('stop_typing', chatId);
          socket.emit('stop_typing', chatId);

          // Emit Gemini AI message to entire chat room and sender
          io.to(chatId.toString()).emit('receive_message', {
            message: aiMessage,
            chat,
          });
          io.to(senderId.toString()).emit('receive_message', {
            message: aiMessage,
            chat,
          });
          socket.emit('receive_message', {
            message: aiMessage,
            chat,
          });

          return;
        }

        // Broadcast message to entire chat room (sender + all participants)
        // Using io.to(chatId) is the most reliable cross-domain delivery method
        io.to(chatId.toString()).emit('receive_message', {
          message,
          chat,
        });

        // Also emit directly to each participant's personal room in case chat not open
        chat.participants.forEach((participant) => {
          const participantId = participant._id.toString();
          if (participantId === senderId.toString()) return;

          // Emit to participant's personal socket room
          io.to(participantId).emit('receive_message', {
            message,
            chat,
          });

          // Send notification
          Notification.create({
            userId: participantId,
            type: 'message',
            fromUser: senderId,
            itemRef: { itemType: 'chat', itemId: chatId },
          }).then((notif) => {
            notif.populate('fromUser', 'name profilePic').then((populated) => {
              io.to(participantId).emit('notification_received', populated);
            });
          });
        });
      } catch (err) {
        console.error('Error handling send_message:', err);
      }
    });

    // Mark messages as read
    socket.on('mark_message_read', async ({ chatId, userId }) => {
      try {
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, status: { $ne: 'read' } },
          { $set: { status: 'read' } }
        );

        io.to(chatId).emit('message_read_update', { chatId, userId });
      } catch (err) {
        console.error('Error marking messages read:', err);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId.toString());
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = socketHandler;
