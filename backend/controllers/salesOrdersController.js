const { Op } = require('sequelize');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const Counter = require('../models/Counter');
const Invoice = require('../models/CustomerInvoice');
const pdfService = require('../services/pdfService');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function getNextSONumber() {
  const key = 'so';
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return 'SO' + String(ctr.seq).padStart(5, '0');
}

async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const key = `ci-${year}`;
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return `INV/${year}/${String(ctr.seq).padStart(4, '0')}`;
}

// GET /api/sales-orders/:id/print
exports.printSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });

    // Generate PDF if requested
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      return await pdfService.generateSalesOrderPDF(so, res);
    }

    // Return JSON payload for non-PDF requests
    const payload = pdfService.generatePrintPayload(so, 'so');
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

// POST /api/sales-orders/:id/create-invoice
exports.createInvoiceFromSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed SO can be invoiced' });

    const invoiceNumber = await getNextInvoiceNumber();
    const invoice_date = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const due_date = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

    const inv = await Invoice.create({
      sales_order_id: so.id,
      invoice_date,
      due_date,
      payment_status: 'Unpaid',
      payment_mode: 'Bank',
      total_amount: so.total_amount,
      invoice_number: invoiceNumber, // will be ignored if not defined in model
    });

    res.status(201).json({ success: true, item: inv });
  } catch (err) { next(err); }
};

// List SOs
exports.listSOs = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const customer = req.query.customer;

    const where = {};
    if (status) where.status = status;
    if (customer) where.customer_id = customer;
    if (q) where.so_number = { [Op.like]: `%${q}%` };

    const { rows, count } = await SalesOrder.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

exports.getSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};

exports.createSO = async (req, res, next) => {
  try {
    const customer = await Contact.findByPk(req.body.customer || req.body.customer_id);
    if (!customer) return res.status(400).json({ message: 'Invalid customer' });

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    for (const line of items) {
      if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
        const prod = await Product.findByPk(line.product);
        if (prod) line.unitPrice = Number(prod.sales_price) || 0;
      }
    }

    const so_number = req.body.soNumber || req.body.so_number || await getNextSONumber();
    const payload = {
      customer_id: req.body.customer || req.body.customer_id,
      items,
      status: 'draft',
      so_number,
      reference: req.body.reference || null,
      so_date: req.body.soDate ? new Date(req.body.soDate) : new Date(),
    };
    const so = await SalesOrder.create(payload);
    res.status(201).json({ success: true, item: so });
  } catch (err) { next(err); }
};

exports.updateSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'draft') return res.status(400).json({ message: 'Only draft SO can be updated' });

    const items = Array.isArray(req.body.items) ? req.body.items : so.items;
    if (Array.isArray(items)) {
      for (const line of items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findByPk(line.product);
          if (prod) line.unitPrice = Number(prod.sales_price) || 0;
        }
      }
    }

    await so.update({
      customer_id: req.body.customer || req.body.customer_id || so.customer_id,
      items,
      status: req.body.status || so.status,
      reference: req.body.reference ?? so.reference,
      so_date: req.body.soDate ? new Date(req.body.soDate) : so.so_date,
    });
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};

exports.confirmSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'draft') return res.status(400).json({ message: 'Only draft SO can be confirmed' });
    await so.update({ status: 'confirmed' });
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};

exports.cancelSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status === 'confirmed') {
      return res.status(400).json({ message: 'Confirmed Sales Orders cannot be cancelled' });
    }
    await so.update({ status: 'cancelled' });
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};
