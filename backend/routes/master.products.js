const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  unarchiveProduct,
  deleteProduct,
} = require('../controllers/productsController');

// Protect all master routes
router.use(requireAuth);

router.get('/', listProducts);
router.get('/:id', getProduct);

// Create
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['Goods','Service']).withMessage('Invalid type'),
    body('salesPrice').isNumeric().withMessage('salesPrice must be a number'),
    body('purchasePrice').isNumeric().withMessage('purchasePrice must be a number'),
    body('salesTax').optional().isNumeric(),
    body('purchaseTax').optional().isNumeric(),
    body('hsnCode').optional().isString(),
    body('category').optional().isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createProduct(req, res, next);
  }
);

// Update
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['Goods','Service']),
    body('salesPrice').optional().isNumeric(),
    body('purchasePrice').optional().isNumeric(),
    body('salesTax').optional().isNumeric(),
    body('purchaseTax').optional().isNumeric(),
    body('hsnCode').optional().isString(),
    body('category').optional().isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updateProduct(req, res, next);
  }
);

// Archive (admin only)
router.patch('/:id/archive', requireRole('admin'), archiveProduct);
router.patch('/:id/unarchive', requireRole('admin'), unarchiveProduct);

// Hard delete (admin only)
router.delete('/:id', requireRole('admin'), deleteProduct);

module.exports = router;
