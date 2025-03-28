const QrCode = require('../models/QrCode');
const Purchase = require('../models/Purchase');
const { logger } = require('../config/logger');
const { decrypt } = require('./encryption');
const { checkPayment } = require('./cryptocloud');

const clients = new Map();

const setupWebSocket = (wss) => {
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      if (data.type === 'register') {
        clients.set(data.token, ws);
      } else if (data.type === 'check_status') {
        const purchase = await Purchase.findOne({ where: { paymentId: data.paymentId }, include: QrCode });
        if (purchase && purchase.status === 'completed') {
          ws.send(JSON.stringify({
            type: 'payment_status',
            paymentId: data.paymentId,
            status: 'completed',
            qrCode: decrypt(purchase.QrCode.code),
          }));
        }
      } else if (data.type === 'chat') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat', message: data.message }));
          }
        });
      }
    });

    ws.on('close', () => {
      for (let [token, client] of clients) {
        if (client === ws) clients.delete(token);
      }
    });
  });

  setInterval(async () => {
    try {
      const purchases = await Purchase.findAll({ where: { status: 'pending' }, include: QrCode });
      for (const purchase of purchases) {
        const status = await checkPayment(purchase.paymentId);
        if (status.status === 'success') {
          purchase.status = 'completed';
          purchase.QrCode.isSold = true;
          purchase.QrCode.soldAt = new Date();
          purchase.QrCode.buyerIp = purchase.buyerIp;
          await purchase.QrCode.save();
          await purchase.save();
          const client = clients.get(purchase.buyerIp);
          if (client) {
            client.send(JSON.stringify({
              type: 'payment_status',
              paymentId: purchase.paymentId,
              status: 'completed',
              qrCode: decrypt(purchase.QrCode.code),
            }));
          }
        }
      }
    } catch (err) {
      logger.error(`WebSocket payment check error: ${err.message}`);
    }
  }, 5000);
};

module.exports = { setupWebSocket };