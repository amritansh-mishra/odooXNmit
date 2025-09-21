
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../db/db');
const mongoose = require('mongoose');

// Models
const Customer = require('../models/Customer');
const Partner = require('../models/Partner');
const Product = require('../models/Product');
const CoA = require('../models/CoA');
const Tax = require('../models/Tax');

(async () => {
  try {
    await connectDB();

    // Upsert helpers
    const upsertOne = async (Model, where, set) => {
      const doc = await Model.findOneAndUpdate(where, { $set: set }, { upsert: true, new: true, setDefaultsOnInsert: true });
      return doc;
    };

    // 1) Customer (buyer)
    const customer = await upsertOne(
      Customer,
      { email: 'nimesh.p@example.com' },
      {
        name: 'Nimesh Pathak',
        loginId: 'nimesh01',
        mobile: '9999900001',
        type: 'Customer',
        isActive: true,
      }
    );

    // 2) Partner (vendor)
    const partner = await upsertOne(
      Partner,
      { email: 'azure@interior.com' },
      {
        name: 'Azure Interior',
        mobile: '9999900002',
        gstNo: '27ABCDE1234F1Z5',
        isActive: true,
      }
    );

    // 3) CoA: Purchase Expense A/c (for vendor bills line default)
    const purchaseExpense = await upsertOne(
      CoA,
      { accountName: 'Purchase Expense A/c' },
      {
        accountName: 'Purchase Expense A/c',
        type: 'Expense',
        description: 'Default purchase expense ledger',
        isActive: true,
      }
    );

    // 4) Taxes
    const gst5 = await upsertOne(
      Tax,
      { name: 'GST 5%' },
      { name: 'GST 5%', method: 'Percentage', value: 5, applicableOn: 'Both', isActive: true }
    );
    const gst10 = await upsertOne(
      Tax,
      { name: 'GST 10%' },
      { name: 'GST 10%', method: 'Percentage', value: 10, applicableOn: 'Both', isActive: true }
    );

    // 5) Products
    const table = await upsertOne(
      Product,
      { name: 'Table' },
      {
        name: 'Table',
        type: 'Goods',
        salesPrice: 3100,
        purchasePrice: 2300,
        salesTax: gst10.value,
        purchaseTax: gst10.value,
        hsnCode: '940370',
        category: 'Furniture',
        isActive: true,
      }
    );

    const chair = await upsertOne(
      Product,
      { name: 'Chair' },
      {
        name: 'Chair',
        type: 'Goods',
        salesPrice: 1000,
        purchasePrice: 850,
        salesTax: gst5.value,
        purchaseTax: gst5.value,
        hsnCode: '956300',
        category: 'Furniture',
        isActive: true,
      }
    );

    console.log('Seed completed successfully');
    console.table([
      { type: 'Customer', id: customer._id.toString(), name: customer.name },
      { type: 'Partner', id: partner._id.toString(), name: partner.name },
      { type: 'CoA', id: purchaseExpense._id.toString(), name: purchaseExpense.accountName },
      { type: 'Tax', id: gst5._id.toString(), name: gst5.name },
      { type: 'Tax', id: gst10._id.toString(), name: gst10.name },
      { type: 'Product', id: table._id.toString(), name: table.name },
      { type: 'Product', id: chair._id.toString(), name: chair.name },
    ]);
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
})();
