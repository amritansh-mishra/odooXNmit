const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const StockLedger = sequelize.define('StockLedger', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('In', 'Out'), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  reference: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  tableName: 'stock_ledger',
  underscored: true,
});

module.exports = StockLedger;
