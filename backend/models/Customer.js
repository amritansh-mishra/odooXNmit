const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Contact = sequelize.define('Contact', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('Customer', 'Vendor', 'Both'), allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  mobile: { type: DataTypes.STRING, allowNull: true },
  address_city: { type: DataTypes.STRING, allowNull: true },
  address_state: { type: DataTypes.STRING, allowNull: true },
  address_pincode: { type: DataTypes.STRING, allowNull: true },
  profile_image: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  archived_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  timestamps: true,
  tableName: 'contacts',
  underscored: true,
});

module.exports = Contact;
