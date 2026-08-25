const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to get or create system AI bot user
const getOrCreateAiUser = async () => {
  let aiUser = await User.findOne({ email: 'ai@peervo.bot' });
  if (!aiUser) {
    aiUser = await User.create({
      name: 'Peervo AI',
      email: 'ai@peervo.bot',
      password: 'ai_bot_protected_password_123',
      bio: '24/7 AI Assistant powered by Google Gemini & Peervo AI. Ask me anything on coding, science, general knowledge, writing, and math!',
      skills: ['Peervo AI', 'General Knowledge', 'Coding', 'Math', 'Writing'],
      education: 'Peervo AI Engine',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    });
  }
  return aiUser;
};

// @desc    Access or create a 1-on-1 chat
// @route   POST /api/chat
// @access  Private
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId parameter is required' });
    }

    // Check if chat already exists between these 2 users
    let isChat = await Chat.find({
      isGroup: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', 'name email profilePic bio')
      .populate('lastMessage');

    isChat = await User.populate(isChat, {
      path: 'lastMessage.senderId',
      select: 'name profilePic email',
    });

    if (isChat.length > 0) {
      res.json(isChat[0]);
    } else {
      // Create new chat
      const chatData = {
        chatName: 'sender',
        isGroup: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate(
        'participants',
        'name email profilePic bio'
      );

      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all chats for logged-in user (auto-includes Peervo AI)
// @route   GET /api/chat
// @access  Private
const fetchChats = async (req, res) => {
  try {
    const aiUser = await getOrCreateAiUser();

    // Ensure user has a chat with Peervo AI Assistant
    if (aiUser._id.toString() !== req.user._id.toString()) {
      let aiChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [req.user._id, aiUser._id] },
      });

      if (!aiChat) {
        aiChat = await Chat.create({
          chatName: 'Peervo AI Chat',
          isGroup: false,
          participants: [req.user._id, aiUser._id],
        });

        const welcomeMsg = await Message.create({
          chatId: aiChat._id,
          senderId: aiUser._id,
          text: 'Hello! I am Peervo AI, your 24/7 free study & coding assistant. Ask me any question about programming, exam prep, or project ideas!',
          status: 'read',
        });

        await Chat.findByIdAndUpdate(aiChat._id, { lastMessage: welcomeMsg._id });
      }
    }

    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', 'name email profilePic bio')
      .populate('groupAdmin', 'name email profilePic')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'lastMessage.senderId',
      select: 'name profilePic email',
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Group Chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    let { users, name } = req.body;

    if (!users || !name) {
      return res.status(400).json({ message: 'Please provide group name and list of users' });
    }

    if (typeof users === 'string') {
      users = JSON.parse(users);
    }

    if (users.length < 1) {
      return res.status(400).json({ message: 'More than 2 users are required to form a group chat' });
    }

    users.push(req.user._id);

    const groupChat = await Chat.create({
      chatName: name,
      participants: users,
      isGroup: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', 'name email profilePic')
      .populate('groupAdmin', 'name email profilePic');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch messages for a specific chat
// @route   GET /api/chat/messages/:chatId
// @access  Private
const fetchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure logged in user is part of chat
    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name profilePic email')
      .sort({ createdAt: 1 });

    // Mark messages sent by others as read
    await Message.updateMany(
      { chatId, senderId: { $ne: req.user._id }, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({ message: 'Chat ID and text are required' });
    }

    let message = await Message.create({
      chatId,
      senderId: req.user._id,
      text,
      status: 'sent',
    });

    message = await message.populate('senderId', 'name profilePic email');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'name profilePic email',
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  fetchMessages,
  sendMessage,
};
