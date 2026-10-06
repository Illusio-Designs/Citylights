const { User, Store } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { compressImage, directories } = require('../config/multer');
const path = require('path');
const fs = require('fs');
const { isValidEmail, MIN_PASSWORD_LENGTH } = require('../utils/validators');

const SAFE_EXCLUDE = ['password', 'resetToken', 'resetTokenExpiry'];

const removeUpload = (req) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err && err.code !== 'ENOENT') console.error('Error deleting file:', err);
        });
    }
};

// Delete a stored profile image (filename in uploads/profile); ignores external URLs
const removeProfileImage = (filename) => {
    if (!filename || /^https?:\/\//i.test(filename)) return;
    const target = path.join(directories.profile, path.basename(filename));
    fs.unlink(target, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting profile image:', err);
    });
};

// Get all users (soft-deleted users are hidden unless asked for explicitly)
exports.getAllUsers = async (req, res) => {
    try {
        const { userType, status } = req.query;
        const where = {};
        if (userType) where.userType = userType;
        if (status) where.status = status;
        else where.status = { [Op.ne]: 'deleted' };

        const users = await User.findAll({
            where,
            include: [{
                model: Store,
                attributes: ['name', 'email']
            }],
            attributes: { exclude: SAFE_EXCLUDE }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
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
            attributes: { exclude: SAFE_EXCLUDE }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, userType, storeId } = req.body;

        if (!fullName || !email || !password || !userType) {
            removeUpload(req);
            return res.status(400).json({ message: 'Full name, email, password and user type are required' });
        }

        if (!isValidEmail(email)) {
            removeUpload(req);
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (String(password).length < MIN_PASSWORD_LENGTH) {
            removeUpload(req);
            return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            removeUpload(req);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate user type
        if (!['admin', 'storeowner'].includes(userType)) {
            removeUpload(req);
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // If storeId is provided, validate that the store exists
        if (storeId) {
            const store = await Store.findByPk(storeId);
            if (!store) {
                removeUpload(req);
                return res.status(400).json({ message: 'Store not found' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile image if uploaded (stored as a filename in uploads/profile)
        let profileImage = null;
        if (req.file) {
            profileImage = await compressImage(req.file.path);
        }

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            userType,
            storeId: storeId || null,
            profileImage,
            status: 'active'
        });

        // Remove sensitive fields from response
        const userResponse = user.toJSON();
        SAFE_EXCLUDE.forEach((f) => delete userResponse[f]);

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        removeUpload(req);
        res.status(500).json({ message: 'Failed to create user' });
    }
};

// Update user (only provided fields change)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            removeUpload(req);
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, email, phoneNumber, userType, storeId } = req.body;

        // Validate user type if provided
        if (userType && !['admin', 'storeowner'].includes(userType)) {
            removeUpload(req);
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // An admin cannot demote themselves (would leave no way to manage users)
        if (userType && userType !== user.userType && String(user.id) === String(req.user.id)) {
            removeUpload(req);
            return res.status(400).json({ message: 'You cannot change your own user type' });
        }

        if (email !== undefined && email !== user.email) {
            if (!isValidEmail(email)) {
                removeUpload(req);
                return res.status(400).json({ message: 'Invalid email format' });
            }
            const taken = await User.findOne({ where: { email } });
            if (taken && taken.id !== user.id) {
                removeUpload(req);
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        // If storeId is provided, validate that the store exists
        if (storeId) {
            const store = await Store.findByPk(storeId);
            if (!store) {
                removeUpload(req);
                return res.status(400).json({ message: 'Store not found' });
            }
        }

        const updates = {};
        if (fullName !== undefined && fullName !== '') updates.fullName = fullName;
        if (email !== undefined && email !== '') updates.email = email;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (userType) updates.userType = userType;
        // storeId present in the body (even empty) means "set or clear the store"
        if (storeId !== undefined) updates.storeId = storeId || null;

        // Handle profile image if uploaded
        if (req.file) {
            const newImage = await compressImage(req.file.path);
            removeProfileImage(user.profileImage);
            updates.profileImage = newImage;
        }

        await user.update(updates);

        const userResponse = user.toJSON();
        SAFE_EXCLUDE.forEach((f) => delete userResponse[f]);

        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user:', error);
        removeUpload(req);
        res.status(500).json({ message: 'Failed to update user' });
    }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (String(user.id) === String(req.user.id)) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        // Soft delete by updating status; keep the profile image file until a hard delete
        await user.update({ status: 'deleted' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};
