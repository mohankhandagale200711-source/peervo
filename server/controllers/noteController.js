const Note = require('../models/Note');
const Notification = require('../models/Notification');
const path = require('path');

// @desc    Upload course note (PDF/DOC/Image)
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, course, tags } = req.body;

    if (!title || !course) {
      return res.status(400).json({ message: 'Title and course name are required' });
    }

    if (!req.file && !req.body.fileUrl) {
      return res.status(400).json({ message: 'Note document file is required' });
    }

    let fileUrl = '';
    let fileType = 'pdf';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) fileType = 'image';
      else if (['.doc', '.docx', '.ppt', '.pptx', '.txt'].includes(ext)) fileType = 'doc';
      else fileType = 'pdf';
    } else {
      fileUrl = req.body.fileUrl;
      fileType = req.body.fileType || 'pdf';
    }

    const tagArray = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const note = await Note.create({
      title,
      course,
      uploadedBy: req.user._id,
      fileUrl,
      fileType,
      tags: tagArray,
      likedBy: [],
      downloads: 0,
    });

    const populatedNote = await Note.findById(note._id).populate('uploadedBy', 'name email profilePic');
    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notes by course
// @route   GET /api/notes/course/:course
// @access  Public
const getNotesByCourse = async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.course);
    const notes = await Note.find({ course: { $regex: new RegExp(`^${courseName}$`, 'i') } })
      .populate('uploadedBy', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search course notes by query, course, or tag
// @route   GET /api/notes/search
// @access  Public
const searchNotes = async (req, res) => {
  try {
    const { q, course, tag, sort } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { course: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    if (course) {
      query.course = { $regex: course, $options: 'i' };
    }

    if (tag) {
      query.tags = { $regex: tag, $options: 'i' };
    }

    if (sort === 'trending') {
      const notes = await Note.find(query)
        .populate('uploadedBy', 'name email profilePic')
        .lean();
      
      notes.sort((a, b) => (b.likedBy ? b.likedBy.length : 0) - (a.likedBy ? a.likedBy.length : 0));
      return res.json(notes);
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Star / Like note
// @route   PUT /api/notes/:id/star
// @access  Private
const starNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const userId = req.user._id;
    const isLiked = note.likedBy.some(id => id.toString() === userId.toString());

    if (isLiked) {
      note.likedBy = note.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      note.likedBy.push(userId);

      // Trigger notification if not self
      if (note.uploadedBy.toString() !== userId.toString()) {
        const notif = await Notification.create({
          userId: note.uploadedBy,
          type: 'star',
          fromUser: userId,
          itemRef: { itemType: 'note', itemId: note._id },
        });

        const io = req.app.get('io');
        if (io) {
          const populatedNotif = await Notification.findById(notif._id).populate('fromUser', 'name profilePic');
          io.to(note.uploadedBy.toString()).emit('notification_received', populatedNotif);
        }
      }
    }

    await note.save();
    const updated = await Note.findById(note._id)
      .populate('uploadedBy', 'name email profilePic')
      .populate('likedBy', 'name profilePic');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment download count
// @route   PUT /api/notes/:id/download
// @access  Public
const incrementDownloads = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    ).populate('uploadedBy', 'name email profilePic');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  getNotesByCourse,
  searchNotes,
  starNote,
  deleteNote,
  incrementDownloads,
};
