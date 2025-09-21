const { Op } = require('sequelize');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const Counter = require('../models/Counter');
const pdfService = require('../services/pdfService');
const taxCalculationService = require('../services/taxCalculationService');

// Helper functions
function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function getNextPONumber() {
  const key = 'po';
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return 'PO' + String(ctr.seq).padStart(5, '0');
}

async function getNextBillNumber() {
  const year = new Date().getFullYear();
  const key = `vb-${year}`;
  const [ctr] = await Counter.findOrCreate({ where: { key }, defaults: { seq: 0 } });
  await ctr.update({ seq: ctr.seq + 1 });
  return `Bill/${year}/${String(ctr.seq).padStart(4, '0')}`;
}

// Item processing (business logic only, no tax calculation)
async function processItems(items) {
  const processed = [];
  
  for (const item of items) {
    const processedItem = {
      product: item.product,
      quantity: Number(item.quantity) || 1,
      unitPrice: item.unitPrice,
      tax: item.tax || null,
      taxRate: Number(item.taxRate) || 0
    };

    // Auto-fill product details if needed
    if (item.product && !processedItem.unitPrice) {
      try {
        const product = await Product.findByPk(item.product);
        if (product) {
          processedItem.unitPrice = Number(product.purchase_price) || 0;
          processedItem.productName = product.name;
          processedItem.hsnCode = product.hsn_code;
        }
      } catch (err) {
        console.error('Product lookup error:', err);
      }
    }

    processedItem.unitPrice = Number(processedItem.unitPrice) || 0;
    processed.push(processedItem);
  }
  
  return processed;
}

//  Main controller methods
exports.listPOs = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { q, status, vendor, includeTaxDetails } = req.query;

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

    // Delegate tax calculation to service if requested
    const items = includeTaxDetails === 'true' 
      ? await Promise.all(rows.map(async (po) => {
          try {
            const taxSummary = await taxCalculationService.calculateOrderSummary(po.items, 'purchase');
            return { ...po.toJSON(), taxSummary };
          } catch (err) {
            return po.toJSON();
          }
        }))
      : rows;

    res.json({ success: true, page, limit, total: count, items });
  } catch (err) { next(err); }
};

exports.getPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    // Delegate tax calculation to service
    const enhancedPO = await taxCalculationService.enhanceOrderWithTaxes(po, 'purchase');
    res.json({ success: true, item: enhancedPO });
  } catch (err) { next(err); }
};

exports.createPO = async (req, res, next) => {
  try {
    // Validate vendor
    const vendor = await Contact.findByPk(req.body.vendor || req.body.vendor_id);
    if (!vendor) return res.status(400).json({ message: 'Invalid vendor' });

    // Process items (business logic only)
    const items = await processItems(req.body.items || []);
    
    // Delegate tax calculation to service
    const totalAmount = await taxCalculationService.calculateOrderTotal(items, 'purchase');

    // Create PO
    const po = await PurchaseOrder.create({
      vendor_id: vendor.id,
      items,
      status: 'draft',
      po_number: req.body.poNumber || req.body.po_number || await getNextPONumber(),
      reference: req.body.reference || null,
      po_date: req.body.poDate ? new Date(req.body.poDate) : new Date(),
      total_amount: totalAmount,
    });

    // Delegate response enhancement to service
    const enhancedPO = await taxCalculationService.enhanceOrderWithTaxes(po, 'purchase');
    res.status(201).json({ success: true, item: enhancedPO });
  } catch (err) { next(err); }
};

exports.updatePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be updated' });

    // Process items (business logic only)
    const items = await processItems(req.body.items || po.items);
    
    // Delegate tax calculation to service
    const totalAmount = await taxCalculationService.calculateOrderTotal(items, 'purchase');

    // Update PO
    await po.update({
      vendor_id: req.body.vendor || req.body.vendor_id || po.vendor_id,
      items,
      reference: req.body.reference ?? po.reference,
      po_date: req.body.poDate ? new Date(req.body.poDate) : po.po_date,
      total_amount: totalAmount,
    });

    // Delegate response enhancement to service
    const enhancedPO = await taxCalculationService.enhanceOrderWithTaxes(po, 'purchase');
    res.json({ success: true, item: enhancedPO });
  } catch (err) { next(err); }
};

exports.printPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    if ((req.query.format || '').toLowerCase() === 'pdf') {
      return await pdfService.generatePurchaseOrderPDF(po, res);
    }

    const payload = pdfService.generatePrintPayload(po, 'po');
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

exports.confirmPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be confirmed' });
    await po.update({ status: 'confirmed' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

exports.cancelPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be cancelled' });
    await po.update({ status: 'cancelled' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

exports.draftPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be reverted to draft' });
    await po.update({ status: 'draft' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

exports.createBillFromPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed PO can be billed' });

    const invoice_date = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const due_date = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);
    const bill_number = await getNextBillNumber();

    // Delegate bill creation with taxes to service
    const bill = await taxCalculationService.createBillFromOrder(po, {
      bill_number,
      reference: req.body.reference || po.reference,
      invoice_date,
      due_date,
      VendorBillModel: VendorBill
    });

    await po.update({ status: 'billed' });

    res.status(201).json({ 
      success: true, 
      message: 'Vendor Bill created successfully', 
      billId: bill.id, 
      bill 
    });
  } catch (err) { next(err); }
};

// Tax-specific endpoints (delegate to service)
exports.getPOTaxDetails = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    const taxDetails = await taxCalculationService.getOrderTaxDetails(po, 'purchase');
    res.json({ success: true, poNumber: po.po_number, ...taxDetails });
  } catch (err) { next(err); }
};

exports.recalculatePOTaxes = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO taxes can be recalculated' });

    const updatedPO = await taxCalculationService.recalculateOrderTaxes(po, 'purchase');
    res.json({ success: true, message: 'Taxes recalculated successfully', item: updatedPO });
  } catch (err) { next(err); }
};
