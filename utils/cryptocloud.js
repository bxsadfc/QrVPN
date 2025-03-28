const axios = require('axios');

const createInvoice = async (amount, currency) => {
  const response = await axios.post('https://api.cryptocloud.plus/v1/invoice/create', {
    shop_id: process.env.CRYPTOCLOUD_SHOP_ID,
    amount,
    currency,
  }, {
    headers: { Authorization: `Token ${process.env.CRYPTOCLOUD_API_KEY}` },
  });
  return response.data.result;
};

const checkPayment = async (paymentId) => {
  const response = await axios.get(`https://api.cryptocloud.plus/v1/invoice/info?uuid=${paymentId}`, {
    headers: { Authorization: `Token ${process.env.CRYPTOCLOUD_API_KEY}` },
  });
  return response.data.result;
};

module.exports = { createInvoice, checkPayment };