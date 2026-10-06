const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multerConfig = require('../config/multer');
const { authenticateToken, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticateToken, requireSelfOrAdmin('id'), userController.getUserById);

// Create new user
router.post('/', authenticateToken, requireAdmin, multerConfig.upload.single('profileImage'), userController.createUser);

// Update user
router.put('/:id', authenticateToken, requireAdmin, multerConfig.upload.single('profileImage'), userController.updateUser);

// Delete user
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router; 