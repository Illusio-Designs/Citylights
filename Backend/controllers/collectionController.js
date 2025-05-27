const { Collection } = require('../models');
const { upload, compressImage, directories } = require('../config/multer');
const path = require('path');

// Configure multer upload for collection image
const uploadImage = upload.single('image');

// Get all collections
exports.getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.findAll();
        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get collection by ID
exports.getCollectionById = async (req, res) => {
    try {
        const collection = await Collection.findByPk(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new collection
exports.createCollection = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: 'Collection name is required' });
        }

        // Handle image upload
        let imageFileName = null;
        if (req.file) {
            const compressedPath = path.join(directories.collections.compressed, req.file.filename);
            await compressImage(req.file.path, compressedPath);
            imageFileName = req.file.filename;
        }

        // Create collection
        const collection = await Collection.create({
            name,
            description: description || null,
            image: imageFileName
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update collection
exports.updateCollection = async (req, res) => {
    try {
        const collection = await Collection.findByPk(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const { name, description } = req.body;

        // Handle image upload
        let imageFileName = collection.image;
        if (req.file) {
            const compressedPath = path.join(directories.collections.compressed, req.file.filename);
            await compressImage(req.file.path, compressedPath);
            imageFileName = req.file.filename;
        }

        // Update collection
        await collection.update({
            name: name || collection.name,
            description: description || collection.description,
            image: imageFileName
        });

        res.json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete collection
exports.deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findByPk(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        await collection.destroy();
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 