const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const SalesOrder = sequelize.define('SalesOrder', {
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  status: { type: DataTypes.ENUM('draft', 'confirmed', 'cancelled'), defaultValue: 'draft' },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  so_number: { type: DataTypes.STRING, allowNull: true, unique: true },
  reference: { type: DataTypes.STRING, allowNull: true },
  so_date: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  tableName: 'sales_orders',
  underscored: true,
});

SalesOrder.beforeSave(async (salesOrder) => {
  const Tax = require('./Tax');
  const items = Array.isArray(salesOrder.items) ? salesOrder.items : [];
  const total = await items.reduce(async (accPromise, item) => {
    const acc = await accPromise;
    let taxAmount = 0;
    if (item?.tax) {
      const taxDoc = await Tax.findByPk(item.tax);
      if (taxDoc) {
        const base = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
        if (taxDoc.method === 'Percentage') taxAmount = (base * (Number(taxDoc.value) || 0)) / 100;
        else if (taxDoc.method === 'Fixed') taxAmount = Number(taxDoc.value) || 0;
      }
    }
    return acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0) + taxAmount;
  }, Promise.resolve(0));
  salesOrder.total_amount = total;
});

module.exports = SalesOrder;
