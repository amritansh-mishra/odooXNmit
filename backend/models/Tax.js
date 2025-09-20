const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Tax = sequelize.define('Tax', {
  name: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.ENUM('Percentage', 'Fixed'), allowNull: false },
  value: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  applicable_on: { type: DataTypes.ENUM('Sales', 'Purchase', 'Both'), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  archived_at: { type: DataTypes.DATE, defaultValue: null }
}, {
  timestamps: true,
  tableName: 'taxes',
  underscored: true,
});

module.exports = Tax;
