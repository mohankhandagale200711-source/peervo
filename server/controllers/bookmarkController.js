const Bookmark = require('../models/Bookmark');

// @desc    Get all saved bookmarks for logged-in user
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const bookmarks = await Bookmark.find({ userId })
      .populate({
        path: 'itemId',
        populate: [
          { path: 'owner', select: 'name email profilePic' },
          { path: 'uploadedBy', select: 'name email profilePic' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a project or note to bookmarks
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'itemType and itemId are required' });
    }

    const itemModel = itemType === 'note' ? 'Note' : 'Project';

    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      itemType,
      itemId,
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Item already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      itemType,
      itemId,
      itemModel,
    });

    const populated = await Bookmark.findById(bookmark._id).populate({
      path: 'itemId',
      populate: [
        { path: 'owner', select: 'name email profilePic' },
        { path: 'uploadedBy', select: 'name email profilePic' },
      ],
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a bookmark by ID or Item ID
// @route   DELETE /api/bookmarks/:id
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if parameter is object id or item deletion
    let bookmark = await Bookmark.findById(id);

    if (!bookmark) {
      // Try finding by itemId for current user
      bookmark = await Bookmark.findOne({
        userId: req.user._id,
        itemId: id,
      });
    }

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove this bookmark' });
    }

    await bookmark.deleteOne();
    res.json({ message: 'Bookmark removed successfully', bookmarkId: bookmark._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
};
