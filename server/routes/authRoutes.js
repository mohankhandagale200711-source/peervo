const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtpAndRegister,
  loginUser,
  logoutUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requirePeervoRequest } = require('../middleware/requestHeaderMiddleware');

// OTP Verification Endpoints (2-Step Email Verification)
router.post('/send-otp', requirePeervoRequest, sendOtp);
router.post('/verify-otp-and-register', requirePeervoRequest, verifyOtpAndRegister);

// Authentication Endpoints
router.post('/login', requirePeervoRequest, loginUser);
router.post('/logout', requirePeervoRequest, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
