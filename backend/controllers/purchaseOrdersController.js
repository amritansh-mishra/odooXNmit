const { Op } = require('sequelize');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const Counter = require('../models/Counter');
const Tax = require('../models/Tax');
const pdfService = require('../services/pdfService');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function getNextBillNumber() {
  const year = new Date().getFullYear();
  const key = `vb-${year}`;
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return `Bill/${year}/${String(ctr.seq).padStart(4, '0')}`;
}

async function getNextPONumber() {
  const key = 'po';
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return 'PO' + String(ctr.seq).padStart(5, '0');
}

// Calculate total amount with taxes for items
async function calculatePOTotal(items) {
  let total = 0;
  for (const item of items || []) {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const lineTotal = quantity * unitPrice;
    
    let taxAmount = 0;
    if (item.tax) {
      try {
        const taxDoc = await Tax.findByPk(item.tax);
        if (taxDoc) {
          if (taxDoc.method === 'Percentage') {
            taxAmount = (lineTotal * (Number(taxDoc.value) || 0)) / 100;
          } else if (taxDoc.method === 'Fixed') {
            taxAmount = Number(taxDoc.value) || 0;
          }
        }
      } catch (err) {
        console.error('Tax calculation error:', err);
      }
    }
    
    total += lineTotal + taxAmount;
  }
  return total;
}

// List POs
exports.listPOs = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status; // draft | confirmed | cancelled | billed
    const vendor = req.query.vendor; // vendor id

    const where = {};
    if (status) where.status = status;
    if (vendor) where.vendor_id = vendor;
    if (q) {
      where[Op.or] = [
        { po_number: { [Op.like]: `%${q}%` } },
        { reference: { [Op.like]: `%${q}%` } }
      ];
    }

    const { rows, count } = await PurchaseOrder.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/purchase-orders/:id
exports.getPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// GET /api/purchase-orders/:id/print
exports.printPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    // Generate PDF if requested
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      return await pdfService.generatePurchaseOrderPDF(po, res);
    }

    // Return JSON payload for non-PDF requests
    const payload = pdfService.generatePrintPayload(po, 'po');
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

// Create PO
exports.createPO = async (req, res, next) => {
  try {
    // ensure vendor exists
    const vendorId = req.body.vendor || req.body.vendor_id;
    const vendor = await Contact.findByPk(vendorId);
    if (!vendor) return res.status(400).json({ message: 'Invalid vendor' });

    // Process items and set default prices
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    for (const line of items) {
      if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
        const prod = await Product.findByPk(line.product);
        if (prod) line.unitPrice = Number(prod.purchase_price) || 0;
      }
      // Ensure required fields have defaults
      line.quantity = Number(line.quantity) || 1;
      line.unitPrice = Number(line.unitPrice) || 0;
      line.taxRate = Number(line.taxRate) || 0;
    }

    // Calculate total amount
    const totalAmount = await calculatePOTotal(items);

    const po_number = req.body.poNumber || req.body.po_number || await getNextPONumber();
    const payload = {
      vendor_id: vendorId,
      items,
      status: 'draft',
      po_number,
      reference: req.body.reference || null,
      po_date: req.body.poDate ? new Date(req.body.poDate) : new Date(),
      total_amount: totalAmount,
    };
    const po = await PurchaseOrder.create(payload);
    res.status(201).json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Update PO (only when draft)
exports.updatePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be updated' });

    // Process items
    const items = Array.isArray(req.body.items) ? req.body.items : po.items;
    if (Array.isArray(items)) {
      for (const line of items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findByPk(line.product);
          if (prod) line.unitPrice = Number(prod.purchase_price) || 0;
        }
        // Ensure required fields have defaults
        line.quantity = Number(line.quantity) || 1;
        line.unitPrice = Number(line.unitPrice) || 0;
        line.taxRate = Number(line.taxRate) || 0;
      }
    }

    // Calculate new total
    const totalAmount = await calculatePOTotal(items);

    await po.update({
      vendor_id: req.body.vendor || req.body.vendor_id || po.vendor_id,
      items,
      status: req.body.status || po.status,
      reference: req.body.reference ?? po.reference,
      po_date: req.body.poDate ? new Date(req.body.poDate) : po.po_date,
      total_amount: totalAmount,
    });

    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Confirm PO
exports.confirmPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be confirmed' });
    await po.update({ status: 'confirmed' });
    res.json({ success: true, message: 'Purchase Order confirmed', item: po });
  } catch (err) { next(err); }
};

// Cancel PO
exports.cancelPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be cancelled' });

    await po.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Purchase Order cancelled', item: po });
  } catch (err) { next(err); }
};

// Revert PO to draft
exports.draftPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be reverted to draft' });

    await po.update({ status: 'draft' });
    res.json({ success: true, message: 'Purchase Order reverted to draft', item: po });
  } catch (err) { next(err); }
};

// Create Vendor Bill from PO
exports.createBillFromPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed PO can be billed' });

    const invoice_date = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const due_date = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

    const bill_number = await getNextBillNumber();

    // Calculate bill totals
    const totalAmount = await calculatePOTotal(po.items);

    const bill = await VendorBill.create({
      bill_number,
      reference: req.body.reference || po.reference,
      purchase_order_id: po.id,
      vendor_id: po.vendor_id,
      invoice_date,
      due_date,
      status: 'confirmed',
      items: po.items,
      total_amount: totalAmount,
      untaxed_amount: totalAmount, // Simplified for now
      tax_amount: 0, // Simplified for now
      amount_due: totalAmount,
    });

    await po.update({ status: 'billed' });

    res.status(201).json({ success: true, message: 'Vendor Bill created successfully', billId: bill.id, bill });
  } catch (err) { next(err); }
};
