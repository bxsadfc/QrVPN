const Feedback = require('../models/Feedback');
const { logger } = require('../config/logger');
const sanitizeHtml = require('sanitize-html');

const submitFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const sanitizedFeedback = sanitizeHtml(feedback);
    const newFeedback = new Feedback({
      text: sanitizedFeedback,
      buyerIp: req.ip,
    });
    await newFeedback.save();
    res.json({ message: req.__('feedback_submitted') });
  } catch (err) {
    logger.error(`Feedback error: ${err.message}`);
    res.status(500).json({ message: req.__('server_error') });
  }
};

module.exports = { submitFeedback };