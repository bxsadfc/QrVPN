const express = require('express');
const { buyQrCode, cancelPurchase } = require('../controllers/payment');
const { submitFeedback } = require('../controllers/feedback');
const { limiter } = require('../middlewares/rateLimit');
const { csrfProtection } = require('../middlewares/csrf');
const { ipCheck, blockSuspiciousIps } = require('../middlewares/ipCheck');
const Purchase = require('../models/Purchase');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

router.use(limiter);
router.use(ipCheck);
router.use(blockSuspiciousIps);

router.post('/buy', csrfProtection, buyQrCode);
router.post('/cancel', csrfProtection, cancelPurchase);
router.post('/feedback', csrfProtection, submitFeedback);

router.get('/history/:purchaseCode', async (req, res) => {
  const { purchaseCode } = req.params;
  const purchase = await Purchase.findOne({ purchaseCode, status: 'completed' }).populate('qrCodeId');
  if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
  res.json({ qrCode: decrypt(purchase.qrCodeId.code) });
});

module.exports = router;