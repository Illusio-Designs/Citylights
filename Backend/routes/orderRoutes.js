const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all orders (admin)
router.get('/', requireAdmin, orderController.getOrders);

// Get filter options for orders (admin)
router.get('/filter-options', requireAdmin, orderController.getOrderFilterOptions);

// Get orders for a specific store owner (that owner, or an admin)
router.get('/store-owner/:userId', requireSelfOrAdmin('userId'), orderController.getStoreOwnerOrders);

// Get single order (owner of the order, or an admin - checked in the controller)
router.get('/:id', orderController.getOrderById);

// Create new order (store owner for themselves; admin on behalf of any store owner)
router.post('/', orderController.createOrder);

// Approve / reject order (admin)
router.put('/:id/approve', requireAdmin, orderController.approveOrder);
router.put('/:id/reject', requireAdmin, orderController.rejectOrder);

// Update / delete order (owner of the order or an admin - checked in the controller)
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
