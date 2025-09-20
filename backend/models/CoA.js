const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const CoA = sequelize.define('CoA', {
  account_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('Asset', 'Liability', 'Expense', 'Income', 'Equity'), allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  archived_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  timestamps: true,
  tableName: 'coa',
  underscored: true,
});

module.exports = CoA;
