// backend/models/index.js
const { sequelize } = require('../db/db');

const User = require('./User');
const Product = require('./Product');
const Contact = require('./Customer');
const CoA = require('./CoA');
const Tax = require('./Tax');
const StockLedger = require('./StockLedger');
const SalesOrder = require('./SalesOrder');
const PurchaseOrder = require('./PurchaseOrder');
const VendorBill = require('./VendorBills');
const Invoice = require('./CustomerInvoice');
const Payment = require('./Payment');
const Counter = require('./Counter');

// Associations
Contact.hasMany(SalesOrder, { foreignKey: 'customer_id' });
SalesOrder.belongsTo(Contact, { foreignKey: 'customer_id' });

SalesOrder.hasMany(Invoice, { foreignKey: 'sales_order_id' });
Invoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });

Invoice.hasMany(Payment, { foreignKey: 'invoice_id' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id' });

Product.hasMany(StockLedger, { foreignKey: 'product_id' });
StockLedger.belongsTo(Product, { foreignKey: 'product_id' });

Contact.hasMany(VendorBill, { foreignKey: 'vendor_id' });
VendorBill.belongsTo(Contact, { foreignKey: 'vendor_id' });

module.exports = {
  sequelize,
  User,
  Product,
  Contact,
  CoA,
  Tax,
  StockLedger,
  SalesOrder,
  PurchaseOrder,
  VendorBill,
  Invoice,
  Payment,
  Counter,
};
