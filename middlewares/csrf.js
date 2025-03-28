const crypto = require('crypto');
const { logger } = require('../config/logger');

const generateCsrfToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') return next(); // Пропускаем GET-запросы

  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken || res.locals.csrfToken;

  if (!csrfToken || csrfToken !== sessionToken) {
    logger.warn(`CSRF attempt detected from IP: ${req.ip}`);
    return res.status(403).json({ message: 'CSRF token invalid' });
  }
  next();
};

// Middleware для генерации токена
const setCsrfToken = (req, res, next) => {
  if (!req.session) req.session = {};
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  next();
};

module.exports = { csrfProtection, setCsrfToken };