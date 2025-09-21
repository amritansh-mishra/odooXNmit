const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
  seedDefaults,
  health,
} = require('../controllers/coaController');

// Protect all master routes
router.use(requireAuth);  // every request to these routes must have a valid JWT, otherwise it will be rejected

router.get('/', listAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.patch('/:id/archive', archiveAccount);
router.patch('/:id/unarchive', unarchiveAccount);

// Hard delete (admin only)
router.delete('/:id', requireRole('admin'), deleteAccount);

router.post('/seed-defaults', seedDefaults);
router.get('/health', health);

module.exports = router;
