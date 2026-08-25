const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');

// @desc    Get user profile by ID with projects & notes
// @route   GET /api/users/:id
// @access  Public / Protected
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({ owner: req.params.id }).sort({ createdAt: -1 });
    const notes = await Note.find({ uploadedBy: req.params.id }).sort({ createdAt: -1 });

    res.json({
      ...user.toObject(),
      projects,
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { name, bio, skills, education } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (education !== undefined) user.education = education;
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();
    const userObject = updatedUser.toObject();
    delete userObject.password;

    res.json(userObject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search students by name or skill
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { name, skill, query } = req.query;
    let filter = {};

    const searchQuery = query || name;
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { skills: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    if (skill) {
      filter.skills = { $regex: skill, $options: 'i' };
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserById,
  updateProfile,
  searchUsers,
};
