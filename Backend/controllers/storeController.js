const { Store, User } = require('../models');
const { compressImage } = require('../config/multer');
const path = require('path');

// Get all stores
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.findAll({
            include: [{
                model: User,
                attributes: ['fullName', 'email']
            }]
        });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get store by ID
exports.getStoreById = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['fullName', 'email']
            }]
        });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new store
exports.createStore = async (req, res) => {
    try {
        const { name, description, address, phone, email } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: 'Store name is required' });
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Check if store with same email already exists
        if (email) {
            const existingStore = await Store.findOne({ where: { email } });
            if (existingStore) {
                return res.status(400).json({ message: 'Store with this email already exists' });
            }
        }

        // Create store
        const store = await Store.create({
            name,
            description: description || null,
            address: address || null,
            phone: phone || null,
            email: email || null,
            status: 'active'
        });

        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update store
exports.updateStore = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const { name, description, address, phone, email } = req.body;

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email is already used by another store
        if (email && email !== store.email) {
            const existingStore = await Store.findOne({ where: { email } });
            if (existingStore) {
                return res.status(400).json({ message: 'Store with this email already exists' });
            }
        }
        
        await store.update({
            name: name || store.name,
            description: description || store.description,
            address: address || store.address,
            phone: phone || store.phone,
            email: email || store.email
        });

        res.json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete store
exports.deleteStore = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        await store.update({ status: 'inactive' });
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 