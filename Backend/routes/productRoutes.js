const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage
} = require('../controllers/productController');

// Product routes
router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Product image routes
router.post('/images', upload.single('product_image'), uploadProductImage);
router.delete('/images/:id', deleteProductImage);

module.exports = router; 