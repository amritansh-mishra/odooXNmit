const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listPOs,
  getPO,
  createPO,
  updatePO,
  confirmPO,
  cancelPO,
  draftPO,
  createBillFromPO,
  printPO,
} = require('../controllers/purchaseOrdersController');

router.use(requireAuth);

// List and get
router.get('/', listPOs);
router.get('/:id', getPO);
router.get('/:id/print', printPO);

// Create
router.post(
  '/',
  [
    body('vendor').notEmpty().withMessage('vendor is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').notEmpty().withMessage('product is required'),
    body('items.*.quantity').isFloat({ gt: 0 }).withMessage('quantity must be > 0'),
    body('items.*.unitPrice').optional().isFloat({ gte: 0 }).withMessage('unitPrice must be >= 0'),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }).withMessage('taxRate must be >= 0'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createPO(req, res, next);
  }
);

// Update (only draft)
router.put(
  '/:id',
  [
    body('vendor').optional().notEmpty(),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.product').optional().notEmpty(),
    body('items.*.quantity').optional().isFloat({ gt: 0 }),
    body('items.*.unitPrice').optional().isFloat({ gte: 0 }),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updatePO(req, res, next);
  }
);

// Status transitions
router.post('/:id/confirm', requireRole('admin'), confirmPO);
router.post('/:id/cancel', requireRole('admin'), cancelPO);
router.post('/:id/draft', requireRole('admin'), draftPO);

// Create Vendor Bill from a confirmed PO
router.post('/:id/create-bill', requireRole('admin'), createBillFromPO);

module.exports = router;
