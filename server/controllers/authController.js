const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'peervo_jwt_secret_key_123', {
    expiresIn: '30d',
  });
};

const getAdminStatus = (user) => {
  const configuredAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(user.isAdmin || (configuredAdmin && user.email.toLowerCase() === configuredAdmin));
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

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account is already registered with this email' });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any previous pending OTPs for this email and save the new one
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
    });

    // Send the email with OTP
    await sendOtpEmail(cleanEmail, otpCode, name || 'Student');

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
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

    // Check OTP in database
    const otpRecord = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
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
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        profilePic: user.profilePic,
        isAdmin: getAdminStatus(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in verifyOtpAndRegister:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Direct Register (Legacy/Fallback)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio, skills, education } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      education: education || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        profilePic: user.profilePic,
        isAdmin: getAdminStatus(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        profilePic: user.profilePic,
        isAdmin: getAdminStatus(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (Current logged in user)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ ...user.toObject(), isAdmin: getAdminStatus(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  registerUser,
  loginUser,
  getMe,
};
