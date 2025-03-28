const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const QrCode = require('./QrCode');

const Purchase = sequelize.define('Purchase', {
  paymentId: { type: DataTypes.STRING, allowNull: false },
  buyerIp: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  purchaseCode: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

Purchase.belongsTo(QrCode, { foreignKey: 'qrCodeId' });
QrCode.hasMany(Purchase, { foreignKey: 'qrCodeId' });

module.exports = Purchase;