const express = require('express');
const router = express.Router();
const { getAdminStats, getAllStudents, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllStudents);
router.delete('/user/:id', protect, adminOnly, deleteUser);

module.exports = router;
