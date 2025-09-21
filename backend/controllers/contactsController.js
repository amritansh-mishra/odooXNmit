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
    const isActive = req.query.isActive;

    // Build where clause - only filter by isActive if explicitly provided
    const where = {};
    if (type) where.type = type;
    
    // Handle isActive parameter properly - ignore 'undefined' string
    if (isActive !== undefined && isActive !== 'undefined' && isActive !== null) {
      where.is_active = isActive === 'true';
    }
    
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
      
      // Only add mobile search if we're not filtering (to avoid column issues)
      if (!isActive || isActive === 'undefined') {
        where[Op.or].push({ mobile: { [Op.like]: `%${q}%` } });
      }
    }

    let rows, count;
    
    try {
      // Try the full query first
      const result = await Contact.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'name', 'type', 'email', 'mobile', 'created_at'] // Only select columns we know exist
      });
      rows = result.rows;
      count = result.count;
    } catch (dbError) {
      console.error('Database query failed, trying simpler query:', dbError.message);
      
      // Fallback to simpler query without problematic columns
      const simpleWhere = {};
      if (type) simpleWhere.type = type;
      
      const result = await Contact.findAndCountAll({
        where: simpleWhere,
        order: [['created_at', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'name', 'type', 'email', 'created_at'] // Minimal columns
      });
      rows = result.rows;
      count = result.count;
    }

    res.json({ success: true, page, limit, total: count, items: rows });
  } catch (err) { 
    console.error('Error in listContacts:', err.message);
    
    // Send a more specific error response
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts',
      error: err.message,
      details: 'Check if database table structure matches the model'
    });
  }
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

// DELETE /api/master/contacts/:id
exports.deleteContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    await doc.destroy();
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) { next(err); }
};

// DEBUG: GET /api/master/contacts/debug - Show all contacts with their types
exports.debugContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.findAll({
      attributes: ['id', 'name', 'type', 'email', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 50
    });
    
    const typeStats = {};
    contacts.forEach(contact => {
      const type = contact.type || 'NULL';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    res.json({ 
      success: true, 
      total: contacts.length,
      typeStats,
      contacts: contacts.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        email: c.email,
        created_at: c.created_at
      }))
    });
  } catch (err) { 
    console.error('Error in debugContacts:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch debug info',
      error: err.message
    });
  }
};
