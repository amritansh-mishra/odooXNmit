const { Op } = require('sequelize');
const Invoice = require('../models/CustomerInvoice');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const CoA = require('../models/CoA');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const key = `ci-${year}`;
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return `INV/${year}/${String(ctr.seq).padStart(4, '0')}`;
}

async function resolveDefaultIncomeAccount() {
  // Optional: resolve a default income account if you need per-line accounts
  const acc = await CoA.findOne({ where: { type: 'Income', is_active: true } });
  return acc ? acc.id : null;
}

// GET /api/customer-invoices
exports.listInvoices = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const customer = req.query.customer;

    const where = {};
    if (status) where.status = status;
    if (customer) where.customer_id = customer;
    if (q) where.invoice_number = { [Op.like]: `%${q}%` };

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

exports.printInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });

    const items = Array.isArray(inv.items) ? inv.items : [];
    const enriched = [];
    for (const l of items) {
      let product = null;
      if (l.product) product = await Product.findByPk(l.product);
      const base = (Number(l.unitPrice) || 0) * (Number(l.quantity) || 0);
      const tax = (base * (Number(l.taxRate) || 0)) / 100;
      enriched.push({
        product: product ? { id: product.id, name: product.name, hsnCode: product.hsn_code } : null,
        account: l.account,
        hsnCode: l.hsnCode,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate || 0,
        lineUntaxed: l.lineUntaxed ?? base,
        lineTax: l.lineTax ?? tax,
        lineTotal: l.lineTotal ?? base + tax,
      });
    }

    const payload = {
      invoiceNumber: inv.invoice_number,
      invoiceDate: inv.invoice_date,
      dueDate: inv.due_date,
      reference: inv.reference || null,
      status: inv.status,
      customer: inv.customer_id,
      salesOrder: inv.sales_order_id,
      items: enriched,
      totals: {
        untaxed: Number(inv.total_untaxed_amount) || 0,
        tax: Number(inv.total_tax_amount) || 0,
        total: Number(inv.total_amount) || 0,
      },
      payments: {
        paidCash: Number(inv.paid_cash) || 0,
        paidBank: Number(inv.paid_bank) || 0,
        amountDue: Number(inv.amount_due) || 0,
      }
    };

    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const doc = await Invoice.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Customer Invoice not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const customerId = req.body.customer || req.body.customer_id;
    const customer = await Contact.findByPk(customerId);
    if (!customer) return res.status(400).json({ message: 'Invalid customer' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    let missingAccount = false;
    for (const line of items) {
      if (line.product) {
        const prod = await Product.findByPk(line.product);
        if (prod) {
          if (line.unitPrice == null && prod.sales_price != null) line.unitPrice = Number(prod.sales_price);
          if (!line.hsnCode && prod.hsn_code) line.hsnCode = prod.hsn_code;
        }
      }
      if (!line.account && defaultIncomeAcc) line.account = defaultIncomeAcc;
    }

    const invoice_number = req.body.invoiceNumber || req.body.invoice_number || await getNextInvoiceNumber();
    const doc = await Invoice.create({
      invoice_number,
      customer_id: customerId,
      sales_order_id: req.body.salesOrder || req.body.sales_order_id || null,
      reference: req.body.reference || null,
      invoice_date: req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date(),
      due_date: req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000),
      status: 'draft',
      items,
    });
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'draft') return res.status(400).json({ message: 'Only draft invoice can be updated' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    const items = Array.isArray(req.body.items) ? req.body.items : inv.items;
    for (const line of items) {
      if (line.product) {
        const prod = await Product.findByPk(line.product);
        if (prod) {
          if (line.unitPrice == null && prod.sales_price != null) line.unitPrice = Number(prod.sales_price);
          if (!line.hsnCode && prod.hsn_code) line.hsnCode = prod.hsn_code;
        }
      }
      if (!line.account && defaultIncomeAcc) line.account = defaultIncomeAcc;
    }

    await inv.update({
      customer_id: req.body.customer || req.body.customer_id || inv.customer_id,
      sales_order_id: req.body.salesOrder || req.body.sales_order_id || inv.sales_order_id,
      reference: req.body.reference ?? inv.reference,
      invoice_date: req.body.invoiceDate ? new Date(req.body.invoiceDate) : inv.invoice_date,
      due_date: req.body.dueDate ? new Date(req.body.dueDate) : inv.due_date,
      items,
    });
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};

exports.confirmInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'draft') return res.status(400).json({ message: 'Only draft invoice can be confirmed' });
    await inv.update({ status: 'confirmed' });
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};

exports.cancelInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status === 'confirmed') return res.status(400).json({ message: 'Confirmed invoices cannot be cancelled' });
    await inv.update({ status: 'cancelled' });
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};

exports.addPayment = async (req, res, next) => {
  try {
    const { mode, amount } = req.body; // mode: Cash|Bank
    if (!['Cash','Bank'].includes(mode)) return res.status(400).json({ message: 'Invalid mode' });
    const amt = Number(amount || 0);
    if (!(amt > 0)) return res.status(400).json({ message: 'Invalid amount' });

    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed invoice can be paid' });

    const patch = {};
    if (mode === 'Cash') patch.paid_cash = Number(inv.paid_cash || 0) + amt;
    else patch.paid_bank = Number(inv.paid_bank || 0) + amt;

    await inv.update(patch);
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};

exports.createFromSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.soId);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed SO can be invoiced' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    const items = Array.isArray(so.items) ? so.items.map((line) => ({
      product: line.product,
      hsnCode: line.hsnCode || null,
      account: defaultIncomeAcc,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxRate: line.taxRate || 0,
    })) : [];

    const invoice_number = await getNextInvoiceNumber();
    const invoice_date = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const due_date = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

    const inv = await Invoice.create({
      invoice_number,
      customer_id: so.customer_id,
      sales_order_id: so.id,
      reference: req.body.reference || null,
      invoice_date,
      due_date,
      items,
      status: 'confirmed',
    });

    res.status(201).json({ success: true, item: inv });
  } catch (err) { next(err); }
};
