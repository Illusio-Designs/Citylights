const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/store/:storeId', reviewController.getReviewsByStore);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/:id', reviewController.getReviewById);
router.post('/', reviewController.createReview);

// Protected routes (require authentication)
router.put('/:id', authenticateToken, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router; 