const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Counter = sequelize.define('Counter', {
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  seq: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  timestamps: true,
  tableName: 'counters',
  underscored: true,
});

module.exports = Counter;
