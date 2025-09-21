const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Contact = sequelize.define('Contact', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('Customer', 'Vendor', 'Both'), allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false }, // Removed unique constraint to avoid index limit
  mobile: { type: DataTypes.STRING, allowNull: true },
  gst_no: { type: DataTypes.STRING, allowNull: true }, // Added for vendors
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
  indexes: [
    // Only create essential indexes to stay under the 64 key limit
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Contact;
