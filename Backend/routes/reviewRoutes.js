const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (only approved reviews)
router.get('/store/:storeId', reviewController.getReviewsByStore);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', reviewController.createReview);

// Admin routes (require authentication)
router.get('/', authenticateToken, reviewController.getAllReviews);
router.get('/pending', authenticateToken, reviewController.getPendingReviews);
router.get('/:id', authenticateToken, reviewController.getReviewById);
router.put('/:id', authenticateToken, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);
router.put('/:id/approve', authenticateToken, reviewController.approveReview);
router.put('/:id/reject', authenticateToken, reviewController.rejectReview);

module.exports = router; 