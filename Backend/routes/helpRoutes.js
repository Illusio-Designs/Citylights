const express = require('express');
const router = express.Router();
const {
    submitHelpRequest,
    getAllHelpRequests,
    updateHelpRequestStatus,
    updateHelpRequest,
    getHelpRequestById,
    assignHelpRequest,
    deleteHelpRequest
} = require('../controllers/helpController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/submit', submitHelpRequest);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllHelpRequests);
router.get('/:id', authenticateToken, requireAdmin, getHelpRequestById);
router.put('/:id/status', authenticateToken, requireAdmin, updateHelpRequestStatus);
router.put('/:id', authenticateToken, requireAdmin, updateHelpRequest);
router.put('/:id/assign', authenticateToken, requireAdmin, assignHelpRequest);
router.delete('/:id', authenticateToken, requireAdmin, deleteHelpRequest);

module.exports = router;