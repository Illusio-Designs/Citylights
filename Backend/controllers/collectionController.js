const {
    sequelize,
    Collection,
    Product,
    ProductVariation,
    ProductImage,
    VariationAttributeMap,
    Review,
    Order,
} = require('../models');
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
            // Compress image and get the new WebP filename
            const compressedFilename = await compressImage(req.file.path);
            imageFileName = compressedFilename;
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
            // Compress image and get the new WebP filename
            const compressedFilename = await compressImage(req.file.path);
            imageFileName = compressedFilename;
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
    const t = await sequelize.transaction();
    try {
        const collection = await Collection.findByPk(req.params.id, { transaction: t });
        if (!collection) {
            await t.rollback();
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Find all products that belong to this collection
        const products = await Product.findAll({
            where: { collection_id: collection.id },
            attributes: ['id'],
            transaction: t,
        });
        const productIds = products.map((p) => p.id);

        if (productIds.length > 0) {
            // Find all variations of those products
            const variations = await ProductVariation.findAll({
                where: { product_id: productIds },
                attributes: ['id'],
                transaction: t,
            });
            const variationIds = variations.map((v) => v.id);

            // Delete the deepest children first (bottom-up) to satisfy FKs
            if (variationIds.length > 0) {
                await ProductImage.destroy({ where: { variation_id: variationIds }, transaction: t });
                await VariationAttributeMap.destroy({ where: { variation_id: variationIds }, transaction: t });
                await ProductVariation.destroy({ where: { id: variationIds }, transaction: t });
            }

            // Other product-dependent records
            await Review.destroy({ where: { product_id: productIds }, transaction: t });
            await Order.destroy({ where: { product_id: productIds }, transaction: t });

            // Now the products themselves
            await Product.destroy({ where: { id: productIds }, transaction: t });
        }

        // Finally the collection
        await collection.destroy({ transaction: t });

        await t.commit();
        res.json({
            message: 'Collection and its products deleted successfully',
            deletedProducts: productIds.length,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
}; 