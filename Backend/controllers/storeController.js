const { Store, User, sequelize } = require('../models');
const { upload, compressImage, directories } = require('../config/multer');
const path = require('path');
const fs = require('fs');
const { Op, fn, col } = require('sequelize');

// Get all stores
exports.getAllStores = async (req, res) => {
    try {
        // Owner details (User) are intentionally not exposed on this public endpoint
        const stores = await Store.findAll();
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Failed to fetch stores' });
    }
};

// Get store by name (case-insensitive)
exports.getStoreByName = async (req, res) => {
    try {
        const store = await Store.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('name')),
                req.params.name.toLowerCase()
            )
        });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Failed to fetch store' });
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
        res.status(500).json({ message: 'Failed to create store' });
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
        
        // Optional: remove specific existing images (JSON array or comma-separated filenames)
        if (req.body.remove_images) {
            let toRemove = [];
            try {
                const parsed = JSON.parse(req.body.remove_images);
                toRemove = Array.isArray(parsed) ? parsed : [String(parsed)];
            } catch (_) {
                toRemove = String(req.body.remove_images).split(',').map((v) => v.trim()).filter(Boolean);
            }
            toRemove = toRemove.map((f) => path.basename(String(f)));
            imageFileNames = imageFileNames.filter((img) => !toRemove.includes(img));
            toRemove.forEach((img) => {
                fs.unlink(path.join(directories.images, img), (err) => {
                    if (err && err.code !== 'ENOENT') console.error('Error deleting image:', err);
                });
            });
        }

        // A field that is sent (even empty) overwrites; a field that is omitted is kept.
        const pick = (incoming, current) => (incoming !== undefined ? (incoming === '' ? null : incoming) : current);
        await store.update({
            name: name || store.name, // name is required, cannot be cleared
            description: pick(description, store.description),
            address: pick(address, store.address),
            phone: pick(phone, store.phone),
            whatsapp_number: pick(whatsapp_number, store.whatsapp_number),
            email: pick(email, store.email),
            logo: logoFileName,
            images: imageFileNames,
            map_location_url: pick(map_location_url, store.map_location_url),
            shop_timings: pick(shop_timings, store.shop_timings)
        });

        res.json(store);
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: 'Failed to update store' });
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

        if (store.images) {
            let imagesArray = [];
            
            // Handle different formats of store.images
            if (Array.isArray(store.images)) {
                imagesArray = store.images;
            } else if (typeof store.images === 'string') {
                try {
                    // Try to parse as JSON if it's a string
                    imagesArray = JSON.parse(store.images);
                    if (!Array.isArray(imagesArray)) {
                        imagesArray = [store.images]; // Treat as single image
                    }
                } catch (e) {
                    imagesArray = [store.images]; // Treat as single image filename
                }
            } else {
                console.warn('store.images is not in expected format:', typeof store.images, store.images);
                imagesArray = [];
            }
            
            imagesArray.forEach(imageName => {
                if (imageName && typeof imageName === 'string') {
                    const imagePath = path.join(directories.images, imageName);
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error('Error deleting image:', err);
                    });
                }
            });
        }

        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        try { await transaction.rollback(); } catch (_) {}
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Failed to delete store' });
    }
};