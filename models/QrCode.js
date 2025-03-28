const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

const QrCode = sequelize.define('QrCode', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('code', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('code');
      return decrypt(encrypted);
    },
  },
  isSold: { type: DataTypes.BOOLEAN, defaultValue: false },
  soldAt: { type: DataTypes.DATE },
  buyerIp: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

module.exports = QrCode;