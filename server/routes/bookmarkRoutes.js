const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

router.get('/:userId', getBookmarks);
router.delete('/:id', removeBookmark);

module.exports = router;
