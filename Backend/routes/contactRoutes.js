const express = require('express');
const router = express.Router();
const {
    submitContact,
    getAllContacts,
    updateContactStatus,
    getContactById,
    deleteContact
} = require('../controllers/contactController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/submit', submitContact);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllContacts);
router.get('/:id', authenticateToken, requireAdmin, getContactById);
router.put('/:id/status', authenticateToken, requireAdmin, updateContactStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteContact);

module.exports = router;