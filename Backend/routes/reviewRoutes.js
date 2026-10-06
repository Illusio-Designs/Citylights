const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes (only approved reviews)
router.get('/store/:storeId', reviewController.getReviewsByStore);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', reviewController.createReview);

// Admin routes (require authentication)
router.get('/', authenticateToken, requireAdmin, reviewController.getAllReviews);
router.get('/pending', authenticateToken, requireAdmin, reviewController.getPendingReviews);
router.get('/:id', authenticateToken, requireAdmin, reviewController.getReviewById);
router.put('/:id', authenticateToken, requireAdmin, reviewController.updateReview);
router.delete('/:id', authenticateToken, requireAdmin, reviewController.deleteReview);
router.put('/:id/approve', authenticateToken, requireAdmin, reviewController.approveReview);
router.put('/:id/reject', authenticateToken, requireAdmin, reviewController.rejectReview);

module.exports = router; 