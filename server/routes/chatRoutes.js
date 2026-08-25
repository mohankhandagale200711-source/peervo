const express = require('express');
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createGroupChat,
  fetchMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(accessChat)
  .get(fetchChats);

router.post('/group', createGroupChat);
router.get('/messages/:chatId', fetchMessages);
router.post('/message', sendMessage);

module.exports = router;
