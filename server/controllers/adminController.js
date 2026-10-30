const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Bookmark = require('../models/Bookmark');
const Chat = require('../models/Chat');

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ email: { $ne: 'ai@peervo.bot' } });
    const totalProjects = await Project.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Recent registered users
    const recentUsers = await User.find({ email: { $ne: 'ai@peervo.bot' } })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalProjects,
      totalNotes,
      totalMessages,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin stats', error: err.message });
  }
};

// GET /api/admin/users
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ email: { $ne: 'ai@peervo.bot' } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student list', error: err.message });
  }
};

// DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid student user ID' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    // Cascade delete user projects, notes, bookmarks, notifications, and messages
    await Promise.all([
      Project.deleteMany({ owner: userId }),
      Note.deleteMany({ uploadedBy: userId }),
      Bookmark.deleteMany({ userId }),
      Notification.deleteMany({ $or: [{ userId }, { fromUser: userId }] }),
      Message.deleteMany({ senderId: userId }),
      Chat.updateMany({ participants: userId }, { $pull: { participants: userId } }),
    ]);

    res.json({ message: 'Student user and all associated records deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
  deleteUser,
};
