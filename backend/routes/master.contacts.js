const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listContacts,
  getContact,
  createContact,
  updateContact,
  archiveContact,
  unarchiveContact,
  deleteContact,
  debugContacts,
} = require('../controllers/contactsController');

// Protect all master routes
router.use(requireAuth);

// Debug route (should be before /:id route)
router.get('/debug', debugContacts);

router.get('/', listContacts);
router.get('/:id', getContact);
// Create
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['Customer','Vendor','Both']).withMessage('Invalid type'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('mobile').optional().isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createContact(req, res, next);
  }
);

// Update
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['Customer','Vendor','Both']),
    body('email').optional().isEmail(),
    body('mobile').optional().isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updateContact(req, res, next);
  }
);

// Archive (admin only)
router.patch('/:id/archive', requireRole('admin'), archiveContact);
router.patch('/:id/unarchive', requireRole('admin'), unarchiveContact);

// Hard delete (admin only)
router.delete('/:id', requireRole('admin'), deleteContact);

module.exports = router;
