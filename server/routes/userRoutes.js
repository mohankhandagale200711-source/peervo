const express = require('express');
const router = express.Router();
const { getUserById, updateProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/:id', protect, upload.single('profilePic'), updateProfile);

module.exports = router;
