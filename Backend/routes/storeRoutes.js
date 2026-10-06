const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { upload } = require('../config/multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer middleware for file uploads
const uploadFields = upload.fields([
    { name: 'store_logo', maxCount: 1 },
    { name: 'store_image', maxCount: 5 }
]);

// Get all stores
router.get('/', storeController.getAllStores);

// Get store by name
router.get('/:name', storeController.getStoreByName);

// Create new store
router.post('/', authenticateToken, requireAdmin, uploadFields, storeController.createStore);

// Update store
router.put('/:id', authenticateToken, requireAdmin, uploadFields, storeController.updateStore);

// Delete store
router.delete('/:id', authenticateToken, requireAdmin, storeController.deleteStore);

module.exports = router; 