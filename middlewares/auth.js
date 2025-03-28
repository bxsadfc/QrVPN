const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.username !== process.env.ADMIN_USERNAME) {
      throw new Error('Invalid credentials');
    }
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Authentication failed: ${err.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { auth };