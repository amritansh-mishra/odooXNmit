const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const VendorBill = sequelize.define('VendorBill', {
  bill_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  reference: { type: DataTypes.STRING, allowNull: true },
  purchase_order_id: { type: DataTypes.INTEGER, allowNull: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: false },
  invoice_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'confirmed', 'cancelled'), defaultValue: 'draft' },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  total_untaxed_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total_tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  paid_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  paid_bank: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  amount_due: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
}, {
  timestamps: true,
  tableName: 'vendor_bills',
  underscored: true,
});

// Pre-save calculation of totals
VendorBill.beforeSave((instance, options) => {
  let untaxed = 0;
  let tax = 0;
  for (const item of instance.items) {
    const lineUntaxed = (item.unitPrice || 0) * (item.quantity || 0);
    const lineTax = (lineUntaxed * (item.taxRate || 0)) / 100;
    item.lineUntaxed = lineUntaxed;
    item.lineTax = lineTax;
    item.lineTotal = lineUntaxed + lineTax;
    untaxed += lineUntaxed;
    tax += lineTax;
  }
  instance.total_untaxed_amount = untaxed;
  instance.total_tax_amount = tax;
  instance.total_amount = untaxed + tax;
  const paid = (instance.paid_cash || 0) + (instance.paid_bank || 0);
  instance.amount_due = Math.max(instance.total_amount - paid, 0);
});

module.exports = VendorBill;
