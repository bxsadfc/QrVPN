const fs = require('fs').promises;
const path = require('path');
const Purchase = require('../models/Purchase');
const { logger } = require('../config/logger');
const { decrypt } = require('./encryption');

const cleanupQrCodes = async () => {
  try {
    const purchases = await Purchase.find({ status: 'completed' });
    const now = Date.now();
    for (const purchase of purchases) {
      const qrCode = await QrCode.findById(purchase.qrCodeId);
      if (qrCode && (now - qrCode.soldAt) > 24 * 60 * 60 * 1000) { // 24 часа
        const filePath = decrypt(qrCode.code);
        await fs.unlink(filePath).catch(() => logger.warn(`File ${filePath} not found`));
        logger.info(`QR code file ${filePath} deleted after 24 hours`);
      }
    }
  } catch (err) {
    logger.error(`Cleanup error: ${err.message}`);
  }
};

module.exports = { cleanupQrCodes };