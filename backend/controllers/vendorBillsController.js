const { Op } = require('sequelize');
const VendorBill = require('../models/VendorBills');
const Product = require('../models/Product');
const CoA = require('../models/CoA');
const Contact = require('../models/Customer');
const Counter = require('../models/Counter');
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

async function resolveDefaultAccount() {
  const acc = await CoA.findOne({ where: { type: 'Expense', is_active: true } });
  return acc ? acc.id : null;
}

exports.listBills = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const vendor = req.query.vendor;

    const where = {};
    if (status) where.status = status;
    if (vendor) where.vendor_id = vendor;
    if (q) where.bill_number = { [Op.like]: `%${q}%` };

    const { rows, count } = await VendorBill.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

exports.getBill = async (req, res, next) => {
  try {
    const doc = await VendorBill.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Vendor Bill not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

exports.createBill = async (req, res, next) => {
  try {
    const vendorId = req.body.vendor || req.body.vendor_id;
    const vendorDoc = await Contact.findByPk(vendorId);
    if (!vendorDoc) return res.status(400).json({ message: 'Invalid vendor' });

    const defaultAccountId = await resolveDefaultAccount();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    for (const line of items) {
      if (line.product) {
        const prod = await Product.findByPk(line.product);
        if (prod) {
          if (line.unitPrice == null && prod.purchase_price != null) line.unitPrice = Number(prod.purchase_price);
          if (!line.hsnCode && prod.hsn_code) line.hsnCode = prod.hsn_code;
        }
      }
      if (!line.account && defaultAccountId) line.account = defaultAccountId;
    }

    const bill_number = req.body.billNumber || req.body.bill_number || await getNextBillNumber();

    const doc = await VendorBill.create({
      bill_number,
      reference: req.body.reference || null,
      purchase_order_id: req.body.purchaseOrder || req.body.purchase_order_id || null,
      vendor_id: vendorId,
      invoice_date: req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date(),
      due_date: req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000),
      status: 'draft',
      items,
    });
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

exports.updateBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'draft') return res.status(400).json({ message: 'Only draft bill can be updated' });

    const defaultAccountId = await resolveDefaultAccount();
    const items = Array.isArray(req.body.items) ? req.body.items : bill.items;
    for (const line of items) {
      if (line.product) {
        const prod = await Product.findByPk(line.product);
        if (prod) {
          if (line.unitPrice == null && prod.purchase_price != null) line.unitPrice = Number(prod.purchase_price);
          if (!line.hsnCode && prod.hsn_code) line.hsnCode = prod.hsn_code;
        }
      }
      if (!line.account && defaultAccountId) line.account = defaultAccountId;
    }

    await bill.update({
      vendor_id: req.body.vendor || req.body.vendor_id || bill.vendor_id,
      purchase_order_id: req.body.purchaseOrder || req.body.purchase_order_id || bill.purchase_order_id,
      reference: req.body.reference ?? bill.reference,
      invoice_date: req.body.invoiceDate ? new Date(req.body.invoiceDate) : bill.invoice_date,
      due_date: req.body.dueDate ? new Date(req.body.dueDate) : bill.due_date,
      items,
    });
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};

exports.printBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });

    // Generate PDF if requested
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      return await pdfService.generateVendorBillPDF(bill, res);
    }

    // Return JSON payload for non-PDF requests
    const payload = pdfService.generatePrintPayload(bill, 'bill');
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

exports.confirmBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'draft') return res.status(400).json({ message: 'Only draft bill can be confirmed' });
    await bill.update({ status: 'confirmed' });
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};

exports.cancelBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    await bill.update({ status: 'cancelled' });
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};

exports.addPayment = async (req, res, next) => {
  try {
    const { mode, amount } = req.body; // mode: Cash|Bank
    if (!['Cash','Bank'].includes(mode)) return res.status(400).json({ message: 'Invalid mode' });
    const amt = Number(amount || 0);
    if (!(amt > 0)) return res.status(400).json({ message: 'Invalid amount' });

    const bill = await VendorBill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bill can be paid' });

    const patch = {};
    if (mode === 'Cash') patch.paid_cash = Number(bill.paid_cash || 0) + amt;
    else patch.paid_bank = Number(bill.paid_bank || 0) + amt;

    await bill.update(patch);
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};
