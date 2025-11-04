const { Store, User, sequelize } = require('../models');
const { upload, compressImage, directories } = require('../config/multer');
const path = require('path');
const fs = require('fs');
const { Op, fn, col } = require('sequelize');

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

// Get store by name (case-insensitive)
exports.getStoreByName = async (req, res) => {
    try {
        console.log('Store name param:', req.params.name);
        const store = await Store.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('name')),
                req.params.name.toLowerCase()
            ),
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
        const { name, description, address, phone, email, whatsapp_number, map_location_url, shop_timings } = req.body;

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

        // Handle logo upload
        let logoFileName = null;
        if (req.files && req.files['store_logo'] && req.files['store_logo'][0]) {
            const logoFile = req.files['store_logo'][0];
            logoFileName = await compressImage(logoFile.path);
        }

        // Handle multiple images upload
        let imageFileNames = [];
        if (req.files && req.files['store_image']) {
            for (const file of req.files['store_image']) {
                const processed = await compressImage(file.path);
                imageFileNames.push(processed);
            }
        }

        // Create store
        const store = await Store.create({
            name,
            description: description || null,
            address: address || null,
            phone: phone || null,
            whatsapp_number: whatsapp_number || null,
            email: email || null,
            logo: logoFileName,
            images: imageFileNames,
            map_location_url: map_location_url || null,
            shop_timings: shop_timings || null,
            status: 'active'
        });

        res.status(201).json(store);
    } catch (error) {
        console.error('Error creating store:', error);
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

        const { name, description, address, phone, email, whatsapp_number, map_location_url, shop_timings } = req.body;

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

        // Handle logo upload
        let logoFileName = store.logo;
        if (req.files && req.files['store_logo'] && req.files['store_logo'][0]) {
            // Delete old logo if exists
            if (store.logo) {
                const oldLogoPath = path.join(directories.logos, store.logo);
                fs.unlink(oldLogoPath, (err) => {
                    if (err) console.error('Error deleting old logo:', err);
                });
            }
            const logoFile = req.files['store_logo'][0];
            logoFileName = await compressImage(logoFile.path);
        }

        // Handle multiple images upload
        let imageFileNames = Array.isArray(store.images) ? store.images : (store.images ? [store.images] : []);
        if (req.files && req.files['store_image']) {
            for (const file of req.files['store_image']) {
                const processed = await compressImage(file.path);
                imageFileNames.push(processed);
            }
        }
        
        await store.update({
            name: name || store.name,
            description: description || store.description,
            address: address || store.address,
            phone: phone || store.phone,
            whatsapp_number: whatsapp_number || store.whatsapp_number,
            email: email || store.email,
            logo: logoFileName,
            images: imageFileNames,
            map_location_url: map_location_url || store.map_location_url,
            shop_timings: shop_timings || store.shop_timings
        });

        res.json(store);
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete store (hard delete): remove DB row, detach users, delete assets
exports.deleteStore = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const store = await Store.findByPk(req.params.id, { transaction });
        if (!store) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Store not found' });
        }

        // Detach users referencing this store (avoid FK constraint errors)
        await User.update({ storeId: null }, { where: { storeId: store.id }, transaction });

        // Commit DB changes before filesystem operations to reduce lock time
        await store.destroy({ transaction });
        await transaction.commit();

        // Delete associated images (best-effort, async, after commit)
        if (store.logo) {
            const logoPath = path.join(directories.logos, store.logo);
            fs.unlink(logoPath, (err) => {
                if (err) console.error('Error deleting logo:', err);
            });
        }

        if (store.images && store.images.length > 0) {
            const imagesArray = Array.isArray(store.images) ? store.images : [store.images];
            imagesArray.forEach(imageName => {
                const imagePath = path.join(directories.images, imageName);
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting image:', err);
                });
            });
        }

        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        try { await transaction.rollback(); } catch (_) {}
        console.error('Error deleting store:', error);
        res.status(500).json({ message: error.message });
    }
};