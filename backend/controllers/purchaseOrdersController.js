const { Op } = require('sequelize');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const Counter = require('../models/Counter');

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

async function resolveDefaultAccount() {
  let acc = await CoA.findOne({ accountName: /Purchase Expense/i });
  if (!acc) acc = await CoA.findOne({ type: 'Expense' });
  return acc ? acc._id : null;
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
    if (q) where.po_number = { [Op.like]: `%${q}%` };

    const { rows, count } = await PurchaseOrder.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/purchase-orders/:id/print
exports.printPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    const items = Array.isArray(po.items) ? po.items : [];
    const enriched = [];
    for (const l of items) {
      let product = null;
      if (l.product) product = await Product.findByPk(l.product);
      const unitPrice = Number(l.unitPrice) || 0;
      const qty = Number(l.quantity) || 0;
      const taxRate = Number(l.taxRate || 0);
      enriched.push({
        product: product ? { id: product.id, name: product.name, hsnCode: product.hsn_code } : null,
        quantity: qty,
        unitPrice,
        taxRate,
        lineUntaxed: unitPrice * qty,
        lineTax: (unitPrice * qty * taxRate) / 100,
        lineTotal: unitPrice * qty * (1 + taxRate / 100),
      });
    }

    const payload = {
      poNumber: po.po_number,
      poDate: po.po_date,
      reference: po.reference || null,
      status: po.status,
      vendor: po.vendor_id,
      items: enriched,
      totals: {
        total: Number(po.total_amount) || 0,
      },
    };
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${po.po_number}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(18).text('Purchase Order', { align: 'center' }).moveDown(0.5);
      doc.fontSize(12)
        .text(`PO No: ${payload.poNumber}`)
        .text(`PO Date: ${new Date(payload.poDate).toDateString()}`)
        .text(`Status: ${payload.status}`)
        .text(`Reference: ${payload.reference || '-'}`)
        .moveDown(0.5);

      // Vendor
      doc.fontSize(12).text('Vendor:', { underline: true });
      const vend = await Contact.findByPk(payload.vendor);
      doc.text(`Name: ${vend.name || ''}`)
         .text(`Email: ${vend.email || ''}`)
         .text(`Mobile: ${vend.mobile || ''}`)
         .moveDown(0.5);

      // Items
      doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
      payload.items.forEach((it, idx) => {
        const p = it.product || {};
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${p.name || 'Item'} | HSN: ${p.hsnCode || ''}`)
          .text(`Qty: ${it.quantity}  Unit: ${it.unitPrice}  Tax%: ${it.taxRate}  Line Total: ${it.lineTotal.toFixed(2)}`);
      });

      // Totals
      doc.moveDown(0.75);
      doc.fontSize(12).text('Totals:', { underline: true });
      doc.text(`Untaxed: ${payload.totals.total.toFixed(2)}`)
         .text(`Tax: ${0.00.toFixed(2)}`)
         .text(`Total: ${payload.totals.total.toFixed(2)}`);

      doc.end();
      return;
    }
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

// Get one PO
exports.getPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Create PO
exports.createPO = async (req, res, next) => {
  try {
    // ensure vendor exists
    const vendorId = req.body.vendor || req.body.vendor_id;
    const vendor = await Contact.findByPk(vendorId);
    if (!vendor) return res.status(400).json({ message: 'Invalid vendor' });

    // Default unitPrice from product if not provided
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    for (const line of items) {
      if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
        const prod = await Product.findByPk(line.product);
        if (prod) line.unitPrice = Number(prod.purchase_price) || 0;
      }
    }

    const po_number = req.body.poNumber || req.body.po_number || await getNextPONumber();
    const payload = {
      vendor_id: vendorId,
      items,
      status: 'draft',
      po_number,
      reference: req.body.reference || null,
      po_date: req.body.poDate ? new Date(req.body.poDate) : new Date(),
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

    const items = Array.isArray(req.body.items) ? req.body.items : po.items;
    if (Array.isArray(items)) {
      for (const line of items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findByPk(line.product);
          if (prod) line.unitPrice = Number(prod.purchase_price) || 0;
        }
      }
    }

    await po.update({
      vendor_id: req.body.vendor || req.body.vendor_id || po.vendor_id,
      items,
      status: req.body.status || po.status,
      reference: req.body.reference ?? po.reference,
      po_date: req.body.poDate ? new Date(req.body.poDate) : po.po_date,
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
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Cancel PO
exports.cancelPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be cancelled' });
    await po.update({ status: 'cancelled' });
    res.json({ success: true, item: po });
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

    // Map items: keep unitPrice/hsnCode/taxRate as-is in JSON
    const bill = await VendorBill.create({
      bill_number,
      reference: req.body.reference || null,
      purchase_order_id: po.id,
      vendor_id: po.vendor_id,
      invoice_date,
      due_date,
      status: 'confirmed',
      items: po.items,
    });

    await po.update({ status: 'billed' });

    res.status(201).json({ success: true, billId: bill.id, bill });
  } catch (err) { next(err); }
};
