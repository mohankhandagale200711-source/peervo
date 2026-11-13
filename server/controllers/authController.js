const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');
const { isAdminUser } = require('../config/adminConfig'); // BUG-21: single source of truth
const { randomInt } = require('crypto');
const { setSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');

const authRateLimits = new Map();
const consumeRateLimit = (store, key, limit, windowMs) => {
  const now = Date.now();
  const recent = (store.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    store.set(key, recent);
    return false;
  }
  recent.push(now);
  store.set(key, recent);
  return true;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Step 1: Send OTP to verify real Email address before registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const rateKey = `${req.ip}:${cleanEmail}`;
    if (!consumeRateLimit(authRateLimits, `send:${rateKey}`, 3, 10 * 60 * 1000)) {
      return res.status(429).json({ message: 'Too many verification requests. Please wait before trying again.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account is already registered with this email' });
    }

    // Generate secure 6-digit OTP
    const otpCode = randomInt(100000, 1000000).toString();

    // Delete any previous pending OTPs for this email and save the new one
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
    });

    // Send the email with OTP
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, name || 'Student');

    if (emailResult.success && !emailResult.simulated) {
      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been sent to ${cleanEmail}`,
      });
    }

    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'Email verification is temporarily unavailable. Please try again later.' });
    }

    return res.status(200).json({
      success: true,
      message: `Development verification code: ${otpCode}`,
      devCode: otpCode,
      simulated: true,
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ message: error.message || 'Failed to send verification code. Please try again.' });
  }
};

// @desc    Step 2: Verify OTP and complete Registration
// @route   POST /api/auth/verify-otp-and-register
// @access  Public
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp, bio, skills, education } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Name, email, password, and 6-digit verification code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!consumeRateLimit(authRateLimits, `verify:${req.ip}:${cleanEmail}`, 10, 10 * 60 * 1000)) {
      return res.status(429).json({ message: 'Too many incorrect verification attempts. Request a new code later.' });
    }

    // BUG-04: OTP expiry is handled by MongoDB TTL index on the Otp model (expires: 600s).
    // The findOne will return null if the document has been auto-deleted after 10 minutes.
    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new one.' });
    }

    // Check if user already registered in the meantime
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verified user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
      education: education || '',
    });

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail });

    if (user) {
      setSessionCookie(res, generateToken(user._id));
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        profilePic: user.profilePic,
        isAdmin: isAdminUser(user),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in verifyOtpAndRegister:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Authenticate user & create an HttpOnly session
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!consumeRateLimit(authRateLimits, `login:${req.ip}:${cleanEmail}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ message: 'Too many sign-in attempts. Please wait before trying again.' });
    }
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      setSessionCookie(res, generateToken(user._id));
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        profilePic: user.profilePic,
        isAdmin: isAdminUser(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Signed out' });
};

// @desc    Get user profile (Current logged in user)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ ...user.toObject(), isAdmin: isAdminUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  loginUser,
  logoutUser,
  getMe,
};
