const { Op } = require('sequelize');
const VendorBill = require('../models/VendorBills');
const Product = require('../models/Product');
const CoA = require('../models/CoA');
const Contact = require('../models/Customer');
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

    const items = bill.items;
    const enriched = [];
    for (const it of items) {
      let product = null;
      if (it.product) product = await Product.findByPk(it.product);
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unitPrice) || 0;
      const rate = Number(it.taxRate || 0);
      enriched.push({
        product: product ? { id: product.id, name: product.name } : null,
        hsnCode: it.hsnCode,
        account: it.account,
        quantity: qty,
        unitPrice: unit,
        taxRate: rate,
        lineUntaxed: unit * qty,
        lineTax: (unit * qty * rate) / 100,
        lineTotal: unit * qty * (1 + rate / 100),
      });
    }

    const payload = {
      billNumber: bill.bill_number,
      invoiceDate: bill.invoice_date,
      dueDate: bill.due_date,
      reference: bill.reference || null,
      status: bill.status,
      vendor: bill.vendor_id,
      items: enriched,
      totals: {
        untaxed: Number(bill.total_untaxed_amount) || 0,
        tax: Number(bill.total_tax_amount) || 0,
        total: Number(bill.total_amount) || 0,
      },
      payments: {
        paidCash: Number(bill.paid_cash) || 0,
        paidBank: Number(bill.paid_bank) || 0,
        amountDue: Number(bill.amount_due) || 0,
      }
    };
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${bill.bill_number}.pdf`);
      doc.pipe(res);

      doc.fontSize(18).text('Vendor Bill', { align: 'center' }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Bill No: ${payload.billNumber}`)
        .text(`Bill Date: ${new Date(payload.invoiceDate).toDateString()}`)
        .text(`Due Date: ${payload.dueDate ? new Date(payload.dueDate).toDateString() : '-'}`)
        .text(`Status: ${payload.status}`)
        .moveDown(0.5);

      doc.fontSize(12).text('Vendor:', { underline: true });
      const vend = await Contact.findByPk(payload.vendor);
      doc.text(`Name: ${vend?.name || ''}`)
         .text(`Email: ${vend?.email || ''}`)
         .text(`Mobile: ${vend?.mobile || ''}`)
         .moveDown(0.5);

      doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
      payload.items.forEach((it, idx) => {
        const p = it.product || {};
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${p.name || 'Item'} | HSN: ${it.hsnCode || ''}`)
          .text(`Qty: ${it.quantity}  Unit: ${it.unitPrice}  Tax%: ${it.taxRate}  Line Total: ${it.lineTotal.toFixed(2)}`);
      });

      doc.moveDown(0.75);
      doc.fontSize(12).text('Totals:', { underline: true });
      doc.text(`Untaxed: ${payload.totals.untaxed.toFixed(2)}`)
         .text(`Tax: ${payload.totals.tax.toFixed(2)}`)
         .text(`Total: ${payload.totals.total.toFixed(2)}`);

      doc.end();
      return;
    }
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
