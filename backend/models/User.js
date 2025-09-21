const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  loginId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) { this.setDataValue('loginId', typeof val === 'string' ? val.trim() : val); }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) { this.setDataValue('email', typeof val === 'string' ? val.trim().toLowerCase() : val); },
    validate: { isEmail: true },
  },
  password: { type: DataTypes.STRING, allowNull: false },
  // Include 'invoicing' for backward compatibility with existing data
  role: { type: DataTypes.ENUM('admin', 'accountant', 'contact', 'invoicing'), defaultValue: 'invoicing' },
  passwordResetToken: { type: DataTypes.STRING, allowNull: true },
  passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  tableName: 'users',
  underscored: true,
});

module.exports = User;