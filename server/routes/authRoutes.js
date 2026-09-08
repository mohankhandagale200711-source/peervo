const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtpAndRegister,
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// OTP Verification Endpoints (2-Step Email Verification)
router.post('/send-otp', sendOtp);
router.post('/verify-otp-and-register', verifyOtpAndRegister);

// Direct Authentication Endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
