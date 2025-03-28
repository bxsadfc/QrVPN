const express = require('express');
const { auth } = require('../middlewares/auth');
const { limiter } = require('../middlewares/rateLimit');
const QrCode = require('../models/QrCode');
const Purchase = require('../models/Purchase');
const Feedback = require('../models/Feedback');
const { logger } = require('../config/logger');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(limiter);
router.use(auth);

router.get('/stats', async (req, res) => {
  const totalQrCodes = await QrCode.countDocuments();
  const soldQrCodes = await QrCode.countDocuments({ isSold: true });
  const purchases = await Purchase.find().populate('qrCodeId');
  res.json({ totalQrCodes, soldQrCodes, purchases });
});

router.get('/feedback', async (req, res) => {
  const feedback = await Feedback.find();
  res.json(feedback);
});

router.delete('/feedback/:id', async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: 'Feedback deleted' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    logger.warn(`Admin login failed from IP: ${req.ip}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;