const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { upload } = require('../config/multer');

// Get all collections
router.get('/', collectionController.getAllCollections);

// Get collection by ID
router.get('/:id', collectionController.getCollectionById);

// Create new collection
router.post('/', upload.single('image'), collectionController.createCollection);

// Update collection
router.put('/:id', upload.single('image'), collectionController.updateCollection);

// Delete collection
router.delete('/:id', collectionController.deleteCollection);

module.exports = router; 