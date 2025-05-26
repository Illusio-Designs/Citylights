const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multerConfig = require('../config/multer');

// Login route
router.post('/login', userController.login);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', multerConfig.upload.single('profileImage'), userController.createUser);

// Update user
router.put('/:id', multerConfig.upload.single('profileImage'), userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router; 