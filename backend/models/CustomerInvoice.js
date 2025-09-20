const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Invoice = sequelize.define('Invoice', {
  invoice_number: { type: DataTypes.STRING, allowNull: true, unique: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: true },
  sales_order_id: { type: DataTypes.INTEGER, allowNull: true },
  reference: { type: DataTypes.STRING, allowNull: true },
  items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.ENUM('draft', 'confirmed', 'cancelled'), defaultValue: 'draft' },
  invoice_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: true },
  payment_status: { type: DataTypes.ENUM('Unpaid', 'Partial', 'Paid'), defaultValue: 'Unpaid' },
  payment_mode: { type: DataTypes.ENUM('Cash', 'Bank'), defaultValue: 'Bank' },
  total_untaxed_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total_tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  paid_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  paid_bank: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  amount_due: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
}, {
  timestamps: true,
  tableName: 'invoices',
  underscored: true,
});

// Compute line totals and invoice totals
Invoice.beforeSave(async (inv) => {
  const items = Array.isArray(inv.items) ? inv.items : [];
  let untaxed = 0;
  let tax = 0;
  for (const item of items) {
    const base = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
    const lineTax = (base * (Number(item.taxRate) || 0)) / 100;
    item.lineUntaxed = base;
    item.lineTax = lineTax;
    item.lineTotal = base + lineTax;
    untaxed += base;
    tax += lineTax;
  }
  inv.total_untaxed_amount = untaxed;
  inv.total_tax_amount = tax;
  inv.total_amount = untaxed + tax;
  const paid = (Number(inv.paid_cash) || 0) + (Number(inv.paid_bank) || 0);
  inv.amount_due = Math.max(Number(inv.total_amount) - paid, 0);
});

module.exports = Invoice;
