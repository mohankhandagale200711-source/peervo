const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotesByCourse,
  searchNotes,
  starNote,
  deleteNote,
  incrementDownloads,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/search', searchNotes);
router.get('/course/:course', getNotesByCourse);

router.route('/')
  .post(protect, upload.single('file'), createNote);

router.route('/:id')
  .delete(protect, deleteNote);

router.put('/:id/star', protect, starNote);
router.put('/:id/download', incrementDownloads);

module.exports = router;
