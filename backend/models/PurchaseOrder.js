const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  vendor_id: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.ENUM('draft', 'confirmed', 'cancelled', 'billed'), defaultValue: 'draft' },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  expected_date: { type: DataTypes.DATE, allowNull: true },
  po_number: { type: DataTypes.STRING, allowNull: true, unique: true },
  po_date: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  reference: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
  tableName: 'purchase_orders',
  underscored: true,
});

PurchaseOrder.beforeSave(async (po) => {
  const Tax = require('./Tax');
  let total = 0;
  for (const item of po.items || []) {
    let taxAmount = 0;
    if (item?.tax) {
      const taxDoc = await Tax.findByPk(item.tax);
      if (taxDoc) {
        const base = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
        if (taxDoc.method === 'Percentage') taxAmount = (base * (Number(taxDoc.value) || 0)) / 100;
        else if (taxDoc.method === 'Fixed') taxAmount = Number(taxDoc.value) || 0;
      }
    }
    total += (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0) + taxAmount;
  }
  po.total_amount = total;
});

module.exports = PurchaseOrder;
