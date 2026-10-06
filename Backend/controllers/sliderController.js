const { Slider, Collection } = require('../models');
const { compressImage } = require('../config/multer');
const path = require('path');
const fs = require('fs');
const { directories } = require('../config/multer');

// Create a new slider
exports.createSlider = async (req, res) => {
    try {
        // Extract data from FormData
        let collection_id = req.body.collection_id || null;
        let title = req.body.title || '';
        let description = req.body.description || '';
        let button_text = req.body.button_text || '';

        // Validate required fields
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: "Title is required." });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: "Image is required." });
        }

        // Validate collection_id is provided
        // if (!collection_id) {
        //     return res.status(400).json({ error: "collection_id is required." });
        // }

        let collection = null;
        if (collection_id) {
            collection = await Collection.findByPk(collection_id);
            if (!collection) {
                console.error("Collection not found for ID:", collection_id);
                return res.status(400).json({
                    error: "Collection does not exist."
                });
            }
        } else {
            collection_id = null; // Set to null if not provided
        }


        // Handle image upload and compression
        let imageFilename = null;
        if (req.file) {
            console.log("Processing uploaded file:", req.file);
            try {
                // Compress the image and get the final filename
                imageFilename = await compressImage(req.file.path);
                console.log("Image compressed, final filename:", imageFilename);
            } catch (compressionError) {
                console.error("Error compressing image:", compressionError);
                // Fallback to original filename if compression fails
                imageFilename = req.file.filename;
            }
        } else {
            console.log("No file uploaded");
        }


        // Create slider
        const slider = await Slider.create({
            collection_id,
            title,
            description,
            button_text,
            image: imageFilename
        });

        res.status(201).json(slider);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all sliders
exports.getSliders = async (req, res) => {
    try {
        const sliders = await Slider.findAll({ include: { model: Collection, as: 'collection' } });
        
        res.json(sliders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single slider by ID
exports.getSliderById = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id, { include: { model: Collection, as: 'collection' } });
        if (!slider) return res.status(404).json({ error: 'Slider not found' });
        res.json(slider);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a slider
exports.updateSlider = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(404).json({ error: 'Slider not found' });
        }

        const { title, description, button_text, collection_id } = req.body;

        if (title !== undefined && String(title).trim() === '') {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ error: 'Title cannot be empty.' });
        }

        if (collection_id) {
            const collection = await Collection.findByPk(collection_id);
            if (!collection) {
                if (req.file) fs.unlink(req.file.path, () => {});
                return res.status(400).json({ error: 'Collection does not exist.' });
            }
        }

        let imageFilename = slider.image;
        let oldImage = null;
        if (req.file) {
            // Process the new image first; only remove the old one once that succeeded
            try {
                imageFilename = await compressImage(req.file.path);
            } catch (compressionError) {
                console.error("Error compressing image:", compressionError);
                // Fallback to original filename if compression fails
                imageFilename = req.file.filename;
            }
            oldImage = slider.image;
        }

        const updates = { image: imageFilename };
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (button_text !== undefined) updates.button_text = button_text;
        // collection_id present in the body (even empty) means "set or clear"
        if (collection_id !== undefined) updates.collection_id = collection_id || null;

        await slider.update(updates);

        if (oldImage && oldImage !== imageFilename) {
            const oldImagePath = path.join(directories.sliders, path.basename(oldImage));
            fs.unlink(oldImagePath, (err) => {
                if (err && err.code !== 'ENOENT') console.error('Error deleting old slider image:', err);
            });
        }

        res.json(slider);
    } catch (error) {
        console.error('Error updating slider:', error);
        res.status(500).json({ error: 'Failed to update slider' });
    }
};

// Delete a slider
exports.deleteSlider = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) return res.status(404).json({ error: 'Slider not found' });
        // Delete image file if it exists
        if (slider.image) {
            const imagePath = path.join(directories.sliders, slider.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await slider.destroy();
        res.json({ message: 'Slider deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Utility function to clean up sliders with missing images
exports.cleanupMissingImages = async (req, res) => {
    try {
        const sliders = await Slider.findAll();
        const cleanupResults = [];
        
        for (const slider of sliders) {
            if (slider.image) {
                const imagePath = path.join(directories.sliders, slider.image);
                
                // Check if the original file exists
                if (!fs.existsSync(imagePath)) {
                    // Check if there's an "-optimized" version of the file
                    const parsedPath = path.parse(slider.image);
                    const optimizedFilename = parsedPath.name + '-optimized' + parsedPath.ext;
                    const optimizedPath = path.join(directories.sliders, optimizedFilename);
                    
                    if (fs.existsSync(optimizedPath)) {
                        // Rename the optimized file to the original name
                        try {
                            fs.renameSync(optimizedPath, imagePath);
                            cleanupResults.push({
                                id: slider.id,
                                title: slider.title,
                                action: 'renamed_optimized_file',
                                from: optimizedFilename,
                                to: slider.image
                            });
                        } catch (renameError) {
                            console.error('Error renaming file:', renameError);
                            cleanupResults.push({
                                id: slider.id,
                                title: slider.title,
                                action: 'rename_failed',
                                error: renameError.message
                            });
                        }
                    } else {
                        // No file found, set image to null
                        await slider.update({ image: null });
                        cleanupResults.push({
                            id: slider.id,
                            title: slider.title,
                            action: 'image_set_to_null',
                            missingFile: slider.image
                        });
                    }
                }
            }
        }
        
        res.json({
            message: 'Cleanup completed',
            results: cleanupResults
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};