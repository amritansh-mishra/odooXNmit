const { Op, fn, col, literal } = require('sequelize');
const CoA = require('../models/CoA');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function mapBodyToModel(body) {
  return {
    account_name: body.accountName ?? body.account_name,
    type: body.type,
    description: body.description,
    is_active: body.isActive ?? body.is_active,
    archived_at: body.archivedAt ?? body.archived_at,
  };
}

// GET /api/master/coa
exports.listAccounts = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type; // Asset | Liability | Expense | Income | Equity
    const isActive = req.query.isActive === 'false' ? false : true;

    const where = { ...(type ? { type } : {}), ...(isActive !== undefined ? { is_active: isActive } : {}) };
    if (q) {
      where[Op.or] = [
        { account_name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await CoA.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/master/coa/:id
exports.getAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/coa
exports.createAccount = async (req, res, next) => {
  try {
    const payload = mapBodyToModel(req.body);
    const doc = await CoA.create(payload);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/coa/:id
exports.updateAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    await doc.update(mapBodyToModel(req.body));
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/coa/:id/archive
exports.archiveAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    await doc.update({ is_active: false, archived_at: new Date() });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/coa/:id/unarchive
exports.unarchiveAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    await doc.update({ is_active: true, archived_at: null });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/coa/seed-defaults
exports.seedDefaults = async (req, res, next) => {
  try {
    const defaults = [
      { account_name: 'Sales Income A/c', type: 'Income', description: 'Default sales revenue account', is_active: true },
      { account_name: 'Purchase Expense A/c', type: 'Expense', description: 'Default purchase expense account', is_active: true },
      { account_name: 'Other Expense A/c', type: 'Expense', description: 'Default miscellaneous expense account', is_active: true },
    ];
    const results = [];
    for (const def of defaults) {
      let existing = await CoA.findOne({ where: { account_name: def.account_name } });
      if (existing) {
        if (!existing.is_active) {
          await existing.update({ is_active: true, archived_at: null });
        }
        results.push({ accountName: def.account_name, status: 'exists', id: existing.id });
      } else {
        const created = await CoA.create(def);
        results.push({ accountName: def.account_name, status: 'created', id: created.id });
      }
    }
    res.status(201).json({ success: true, results });
  } catch (err) { next(err); }
};

// GET /api/master/coa/health
exports.health = async (req, res, next) => {
  try {
    const activeIncome = await CoA.findOne({ where: { type: 'Income', is_active: true } });
    const activeExpense = await CoA.findOne({ where: { type: 'Expense', is_active: true } });
    const salesIncome = await CoA.findOne({ where: { account_name: { [Op.like]: '%Sales Income%' }, is_active: true } });
    const purchaseExpense = await CoA.findOne({ where: { account_name: { [Op.like]: '%Purchase Expense%' }, is_active: true } });

    const byType = await CoA.findAll({
      attributes: [ 'type', 'is_active', [fn('COUNT', literal('*')), 'count'] ],
      group: ['type', 'is_active'],
      raw: true,
    });

    res.json({
      success: true,
      requirements: {
        hasActiveIncome: !!activeIncome,
        hasActiveExpense: !!activeExpense,
        hasSalesIncomeAccount: !!salesIncome,
        hasPurchaseExpenseAccount: !!purchaseExpense,
      },
      stats: byType.map(r => ({ type: r.type, isActive: !!r.is_active, count: Number(r.count) })),
    });
  } catch (err) { next(err); }
};
