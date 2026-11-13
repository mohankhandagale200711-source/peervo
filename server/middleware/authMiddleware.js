const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdminUser } = require('../config/adminConfig');
const { COOKIE_NAME, readCookie } = require('../utils/sessionCookie');

const protect = async (req, res, next) => {
  const token = readCookie(req.headers.cookie, COOKIE_NAME);
  if (token) {
    try {
      // Browsers must send the custom header on protected API requests. With
      // strict CORS this blocks cross-site form submissions using the session cookie.
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Peervo-Request') !== '1') {
        return res.status(403).json({ message: 'Request verification failed' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && isAdminUser(req.user)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly };
