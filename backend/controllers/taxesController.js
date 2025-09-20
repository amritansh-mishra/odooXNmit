const { Op } = require('sequelize');
const Tax = require('../models/Tax');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function mapBodyToModel(body) {
  return {
    name: body.name,
    method: body.method, // 'Percentage' | 'Fixed'
    value: body.value,
    applicable_on: body.applicableOn ?? body.applicable_on, // 'Sales' | 'Purchase' | 'Both'
    is_active: body.isActive ?? body.is_active,
    archived_at: body.archivedAt ?? body.archived_at,
  };
}

// GET /api/master/taxes
exports.listTaxes = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const applicableOn = req.query.applicableOn; // Sales | Purchase | Both
    const isActive = req.query.isActive === 'false' ? false : true; // default true

    const where = {
      ...(applicableOn ? { applicable_on: applicableOn } : {}),
      ...(isActive !== undefined ? { is_active: isActive } : {}),
    };
    if (q) {
      where[Op.or] = [{ name: { [Op.like]: `%${q}%` } }];
    }

    const { rows, count } = await Tax.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/master/taxes/:id
exports.getTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/taxes
exports.createTax = async (req, res, next) => {
  try {
    const doc = await Tax.create(mapBodyToModel(req.body));
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/taxes/:id
exports.updateTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    await doc.update(mapBodyToModel(req.body));
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/taxes/:id/archive
exports.archiveTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    await doc.update({ is_active: false, archived_at: new Date() });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/taxes/:id/unarchive
exports.unarchiveTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    await doc.update({ is_active: true, archived_at: null });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
