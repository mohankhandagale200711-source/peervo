const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');
const Message = require('../models/Message');

// GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
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
exports.getAllStudents = async (req, res) => {
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
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Project.deleteMany({ owner: userId });
    await Note.deleteMany({ uploadedBy: userId });
    res.json({ message: 'Student user and related items deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};
