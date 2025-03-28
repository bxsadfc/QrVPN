const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  text: { type: String, required: true },
  buyerIp: { type: String, required: true },
  moderated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);