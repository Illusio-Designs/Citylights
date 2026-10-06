const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public: resolve by page_name like ?page_name=home
router.get('/', seoController.getByPageName);

// Admin: basic upsert and list (could be protected later)
router.get('/all', authenticateToken, requireAdmin, seoController.list);
router.get('/resolve', seoController.resolveByPath);
router.post('/', authenticateToken, requireAdmin, seoController.upsert);

module.exports = router;


