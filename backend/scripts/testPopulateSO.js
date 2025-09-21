

// Quick test for populate('customer','name email') on SalesOrder
// Usage: node backend/scripts/testPopulateSO.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../db/db');
const mongoose = require('mongoose');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

(async () => {
  try {
    await connectDB();

    // Find a customer and two products from seed
    const customer = await Customer.findOne({ email: 'nimesh.p@example.com' });
    const table = await Product.findOne({ name: 'Table' });
    const chair = await Product.findOne({ name: 'Chair' });

    if (!customer || !table || !chair) {
      console.error('Missing seed data. Run: node backend/scripts/seed.js');
      process.exit(1);
    }

    // Create a temporary SO if none exists
    let so = await SalesOrder.findOne({ customer: customer._id });
    if (!so) {
      so = await SalesOrder.create({
        soNumber: 'SOPOP-' + Date.now(),
        customer: customer._id,
        items: [
          { product: table._id, quantity: 2, unitPrice: table.salesPrice || 3100, taxRate: 10 },
          { product: chair._id, quantity: 1, unitPrice: chair.salesPrice || 1000, taxRate: 5 }
        ],
      });
    }

    // Query with populate
    const populated = await SalesOrder.findById(so._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name salesPrice')
      .lean();

    console.log('Populated Sales Order:');
    console.dir(populated, { depth: null });
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
})();
