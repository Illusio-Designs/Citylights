const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all orders (admin)
router.get('/', orderController.getOrders);

// Get filter options for orders
router.get('/filter-options', orderController.getOrderFilterOptions);

// Get orders for a specific store owner
router.get('/store-owner/:userId', orderController.getStoreOwnerOrders);

// Get single order
router.get('/:id', orderController.getOrderById);

// Create new order (store owner)
router.post('/', orderController.createOrder);

// Approve order (admin)
router.put('/:id/approve', orderController.approveOrder);

// Reject order (admin)
router.put('/:id/reject', orderController.rejectOrder);

// Update order
router.put('/:id', orderController.updateOrder);

// Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router; 