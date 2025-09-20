const { Op } = require('sequelize');
const Product = require('../models/Product');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function mapBodyToModel(body) {
  return {
    name: body.name,
    type: body.type,
    sales_price: body.salesPrice ?? body.sales_price,
    purchase_price: body.purchasePrice ?? body.purchase_price,
    sales_tax: body.salesTax ?? body.sales_tax,
    purchase_tax: body.purchaseTax ?? body.purchase_tax,
    hsn_code: body.hsnCode ?? body.hsn_code,
    category: body.category,
    is_active: body.isActive ?? body.is_active,
    archived_at: body.archivedAt ?? body.archived_at,
  };
}

// GET /api/master/products
exports.listProducts = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type; // Goods | Service
    const isActive = req.query.isActive === 'false' ? false : true; // default true

    const where = { ...(type ? { type } : {}), ...(isActive !== undefined ? { is_active: isActive } : {}) };
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } },
        { hsn_code: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/master/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/products
exports.createProduct = async (req, res, next) => {
  try {
    const payload = mapBodyToModel(req.body);
    const doc = await Product.create(payload);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const payload = mapBodyToModel(req.body);
    const doc = await Product.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    await doc.update(payload);
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/products/:id/archive
exports.archiveProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    await doc.update({ is_active: false, archived_at: new Date() });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/products/:id/unarchive
exports.unarchiveProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    await doc.update({ is_active: true, archived_at: null });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
