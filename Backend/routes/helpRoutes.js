const express = require('express');
const router = express.Router();
const {
    submitHelpRequest,
    getAllHelpRequests,
    updateHelpRequestStatus,
    getHelpRequestById,
    assignHelpRequest
} = require('../controllers/helpController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/submit', submitHelpRequest);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllHelpRequests);
router.get('/:id', authenticateToken, requireAdmin, getHelpRequestById);
router.put('/:id/status', authenticateToken, requireAdmin, updateHelpRequestStatus);
router.put('/:id/assign', authenticateToken, requireAdmin, assignHelpRequest);

module.exports = router;