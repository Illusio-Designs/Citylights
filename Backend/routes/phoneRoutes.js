const express = require('express');
const router = express.Router();
const {
    submitPhone,
    getAllPhoneSubmissions,
    updatePhoneStatus,
    deletePhoneSubmission
} = require('../controllers/phoneController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/submit', submitPhone);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllPhoneSubmissions);
router.put('/:id/status', authenticateToken, requireAdmin, updatePhoneStatus);
router.delete('/:id', authenticateToken, requireAdmin, deletePhoneSubmission);

module.exports = router;