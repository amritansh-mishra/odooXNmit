const { Op } = require('sequelize');
const Contact = require('../models/Customer');

// Helpers
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
    email: body.email,
    mobile: body.mobile,
    address_city: body.address?.city ?? body.address_city,
    address_state: body.address?.state ?? body.address_state,
    address_pincode: body.address?.pincode ?? body.address_pincode,
    profile_image: body.profileImage ?? body.profile_image,
    is_active: body.isActive ?? body.is_active,
    archived_at: body.archivedAt ?? body.archived_at,
  };
}

// GET /api/master/contacts
exports.listContacts = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type;
    const isActive = req.query.isActive === 'false' ? false : true;

    const where = { ...(type ? { type } : {}), ...(isActive !== undefined ? { is_active: isActive } : {}) };
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mobile: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await Contact.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { next(err); }
};

// GET /api/master/contacts/:id
exports.getContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/contacts
exports.createContact = async (req, res, next) => {
  try {
    const payload = mapBodyToModel(req.body);
    const doc = await Contact.create(payload);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/contacts/:id
exports.updateContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    await doc.update(mapBodyToModel(req.body));
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/contacts/:id/archive
exports.archiveContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    await doc.update({ is_active: false, archived_at: new Date() });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/contacts/:id/unarchive
exports.unarchiveContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    await doc.update({ is_active: true, archived_at: null });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
