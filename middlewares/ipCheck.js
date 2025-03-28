const expressIp = require('express-ip');
const { logger } = require('../config/logger');

const ipCheck = expressIp().getIpInfoMiddleware;

const blockSuspiciousIps = (req, res, next) => {
  const ipInfo = req.ipInfo;
  if (ipInfo && ipInfo.range && ipInfo.range.includes('blacklisted_range')) { // Пример блокировки
    logger.warn(`Blocked suspicious IP: ${ipInfo.ip}`);
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { ipCheck, blockSuspiciousIps };