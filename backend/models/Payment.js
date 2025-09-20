const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Payment = sequelize.define('Payment', {
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  payment_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  payment_mode: { type: DataTypes.ENUM('Cash', 'Bank'), defaultValue: 'Bank' },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  notes: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
  tableName: 'payments',
  underscored: true,
});

module.exports = Payment;
