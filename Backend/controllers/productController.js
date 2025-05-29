const { Product, ProductVariation, VariationAttribute, VariationValue, VariationAttributeMap, ProductImage } = require('../models');
const { compressImage, directories } = require('../config/multer');
const path = require('path');
const { Op } = require('sequelize');
const fs = require('fs');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, collection_id, slug, meta_title, meta_desc, variations } = req.body;

        // Create product
        const product = await Product.create({
            name,
            description,
            collection_id,
            slug,
            meta_title,
            meta_desc
        });

        // Handle variations if provided
        if (variations && Array.isArray(variations)) {
            for (const variation of variations) {
                const { sku, price, usecase, attributes } = variation;
                
                // Create variation
                const productVariation = await ProductVariation.create({
                    product_id: product.id,
                    sku,
                    price,
                    usecase
                });

                // Handle attributes
                if (attributes && Array.isArray(attributes)) {
                    for (const attr of attributes) {
                        const { name, value } = attr;
                        
                        // Find or create attribute
                        let [attribute] = await VariationAttribute.findOrCreate({
                            where: { name }
                        });

                        // Find or create value
                        let [attrValue] = await VariationValue.findOrCreate({
                            where: {
                                variation_attr_id: attribute.id,
                                value
                            }
                        });

                        // Create mapping
                        await VariationAttributeMap.create({
                            variation_id: productVariation.id,
                            variation_value_id: attrValue.id
                        });
                    }
                }
            }
        }

        res.status(201).json({
            success: true,
            data: await Product.findByPk(product.id, {
                include: [
                    {
                        model: ProductVariation,
                        include: [
                            {
                                model: ProductImage
                            }
                        ]
                    }
                ]
            })
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductVariation,
                    include: [
                        {
                            model: ProductImage
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductVariation,
                    include: [
                        {
                            model: ProductImage
                        }
                    ]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, collection_id, slug, meta_title, meta_desc } = req.body;
        
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        await product.update({
            name,
            description,
            collection_id,
            slug,
            meta_title,
            meta_desc
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductVariation,
                    include: [
                        {
                            model: ProductImage
                        }
                    ]
                }
            ]
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Delete all associated images first
        for (const variation of product.ProductVariations) {
            for (const image of variation.ProductImages) {
                // Delete the physical file
                const filePath = path.join(directories.products.compressed, image.image_url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await image.destroy();
            }

            // Delete variation attribute mappings
            await VariationAttributeMap.destroy({
                where: { variation_id: variation.id }
            });
        }

        // Delete all variations
        await ProductVariation.destroy({
            where: { product_id: product.id }
        });

        // Finally delete the product
        await product.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Upload product image
exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image'
            });
        }

        const { variation_id, is_primary } = req.body;
        
        // Compress the image
        const compressedFilename = await compressImage(req.file.path);

        // Create image record
        const image = await ProductImage.create({
            variation_id,
            image_url: compressedFilename,
            is_primary: is_primary === 'true'
        });

        res.status(201).json({
            success: true,
            data: image
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
    try {
        const image = await ProductImage.findByPk(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }

        // Delete the file
        const filePath = path.join(directories.products.compressed, image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 