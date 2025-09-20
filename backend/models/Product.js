const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('Goods', 'Service'), allowNull: false },
  sales_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  purchase_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sales_tax: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  purchase_tax: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  hsn_code: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  archived_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  timestamps: true,
  tableName: 'products',
  underscored: true,
});

module.exports = Product;
