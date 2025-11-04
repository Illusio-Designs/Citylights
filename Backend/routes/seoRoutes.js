const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');

// Public: resolve by page_name like ?page_name=home
router.get('/', seoController.getByPageName);

// Admin: basic upsert and list (could be protected later)
router.get('/all', seoController.list);
router.post('/', seoController.upsert);

module.exports = router;


