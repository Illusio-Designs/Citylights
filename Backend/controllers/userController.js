const { User, Store } = require('../models');
const bcrypt = require('bcryptjs');
const { compressImage } = require('../config/multer');
const path = require('path');
const fs = require('fs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { userType, status } = req.query;
        const where = {};
        if (userType) where.userType = userType;
        if (status) where.status = status;

        const users = await User.findAll({
            where,
            include: [{
                model: Store,
                attributes: ['name', 'email']
            }],
            attributes: { exclude: ['password'] } // Exclude password from response
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{
                model: Store,
                attributes: ['name', 'email']
            }],
            attributes: { exclude: ['password'] } // Exclude password from response
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, userType, storeId } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate user type
        if (!['admin', 'storeowner'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // If storeId is provided, validate that the store exists
        if (storeId) {
            const store = await Store.findByPk(storeId);
            if (!store) {
                return res.status(400).json({ message: 'Store not found' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            const outputPath = path.join(__dirname, '../uploads', `profile-${Date.now()}.jpg`);
            await compressImage(req.file.path, outputPath);
            profileImage = outputPath;
        }

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            userType,
            storeId: storeId || null, // Set to null if not provided or empty
            profileImage,
            status: 'active'
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, email, phoneNumber, userType, storeId } = req.body;
        
        // Validate user type if provided
        if (userType && !['admin', 'storeowner'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // If storeId is provided, validate that the store exists
        if (storeId) {
            const store = await Store.findByPk(storeId);
            if (!store) {
                return res.status(400).json({ message: 'Store not found' });
            }
        }

        // Handle profile image if uploaded
        if (req.file) {
            // Delete old profile image if exists
            if (user.profileImage) {
                fs.unlink(user.profileImage, (err) => {
                    if (err) console.error('Error deleting old profile image:', err);
                });
            }

            const outputPath = path.join(__dirname, '../uploads', `profile-${Date.now()}.jpg`);
            await compressImage(req.file.path, outputPath);
            user.profileImage = outputPath;
        }

        // Update user fields
        await user.update({
            fullName,
            email,
            phoneNumber,
            userType,
            storeId: storeId || null // Set to null if not provided or empty
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete by updating status
        await user.update({ status: 'deleted' });

        // Delete profile image if exists
        if (user.profileImage) {
            fs.unlink(user.profileImage, (err) => {
                if (err) console.error('Error deleting profile image:', err);
            });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};