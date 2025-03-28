const { createInvoice, checkPayment } = require('../utils/cryptocloud');
const QrCode = require('../models/QrCode');
const Purchase = require('../models/Purchase');
const { logger } = require('../config/logger');
const { decrypt } = require('../utils/encryption');

const buyQrCode = async (req, res) => {
  try {
    const buyerIp = req.ip;
    const availableQr = await QrCode.findOne({ where: { isSold: false } });
    if (!availableQr) {
      return res.status(400).json({ message: req.__('no_qr_codes') });
    }

    const invoice = await createInvoice(10, 'USD');
    const purchaseCode = Math.random().toString(36).substring(2, 15);
    const purchase = await Purchase.create({
      qrCodeId: availableQr.id,
      paymentId: invoice.paymentId,
      buyerIp,
      purchaseCode,
    });

    res.json({ paymentUrl: invoice.paymentUrl, paymentId: invoice.paymentId, purchaseCode });
  } catch (err) {
    logger.error(`Payment error: ${err.message}`);
    res.status(500).json({ message: req.__('server_error') });
  }
};

const cancelPurchase = async (req, res) => {
  const { paymentId } = req.body;
  const purchase = await Purchase.findOne({ where: { paymentId, status: 'pending' } });
  if (!purchase) return res.status(400).json({ message: 'Purchase not found or already completed' });
  purchase.status = 'failed';
  await purchase.save();
  res.json({ message: 'Purchase cancelled' });
};

module.exports = { buyQrCode, cancelPurchase };