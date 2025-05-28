const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multerConfig = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// Create new user
router.post('/', authenticateToken, multerConfig.upload.single('profileImage'), userController.createUser);

// Update user
router.put('/:id', authenticateToken, multerConfig.upload.single('profileImage'), userController.updateUser);

// Delete user
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router; 