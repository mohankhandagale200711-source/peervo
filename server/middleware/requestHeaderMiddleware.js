const requirePeervoRequest = (req, res, next) => {
  if (req.get('X-Peervo-Request') !== '1') {
    return res.status(403).json({ message: 'Request verification failed' });
  }
  return next();
};

module.exports = { requirePeervoRequest };
