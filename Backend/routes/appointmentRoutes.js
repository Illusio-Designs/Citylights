const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getAllAppointments,
    updateAppointmentStatus,
    getAppointmentById,
    getAppointmentsByStore,
    deleteAppointment
} = require('../controllers/appointmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/book', bookAppointment);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllAppointments);
router.get('/:id', authenticateToken, requireAdmin, getAppointmentById);
router.put('/:id/status', authenticateToken, requireAdmin, updateAppointmentStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteAppointment);

// Store owner routes
router.get('/store/:store_id', authenticateToken, getAppointmentsByStore);

module.exports = router;