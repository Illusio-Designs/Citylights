const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Define all required directories
const directories = {
    uploads: path.join(__dirname, '../uploads'),
    compressed: path.join(__dirname, '../uploads/compressed'),
    collections: {
        original: path.join(__dirname, '../uploads/collections'),
        compressed: path.join(__dirname, '../uploads/compressed/collections')
    },
    products: {
        original: path.join(__dirname, '../uploads/products'),
        compressed: path.join(__dirname, '../uploads/compressed/products')
    },
    images: {
        original: path.join(__dirname, '../uploads/images'),
        compressed: path.join(__dirname, '../uploads/compressed/images')
    },
    logos: {
        original: path.join(__dirname, '../uploads/logos'),
        compressed: path.join(__dirname, '../uploads/compressed/logos')
    },
    profile: {
        original: path.join(__dirname, '../uploads/profile'),
        compressed: path.join(__dirname, '../uploads/compressed/profile')
    }
};

// Create all required directories
Object.values(directories).forEach(dir => {
    if (typeof dir === 'string') {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } else {
        Object.values(dir).forEach(subDir => {
            if (!fs.existsSync(subDir)) {
                fs.mkdirSync(subDir, { recursive: true });
            }
        });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine which directory to use based on field name
        let dest;
        switch (file.fieldname) {
            case 'logo':
                dest = directories.logos.original;
                break;
            case 'collection_image':
                dest = directories.collections.original;
                break;
            case 'product_image':
                dest = directories.products.original;
                break;
            case 'profile':
                dest = directories.profile.original;
                break;
            default:
                dest = directories.images.original;
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Compress and resize image
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save compressed image
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Filename of compressed image
 */
async function compressImage(inputPath, outputPath, options = {}) {
    const defaultOptions = {
        width: 800, // Default width
        height: 800, // Default height
        quality: 80, // Default quality
        format: 'jpeg' // Default format
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        // Create compressed directory if it doesn't exist
        const compressedDir = path.dirname(outputPath);
        if (!fs.existsSync(compressedDir)) {
            fs.mkdirSync(compressedDir, { recursive: true });
        }

        await sharp(inputPath)
            .resize(finalOptions.width, finalOptions.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat(finalOptions.format, { quality: finalOptions.quality })
            .toFile(outputPath);

        // Delete original file after compression
        fs.unlink(inputPath, (err) => {
            if (err) console.error('Error deleting original file:', err);
        });

        // Return only the filename, not the full path
        return path.basename(outputPath);
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

module.exports = {
    upload,
    compressImage,
    directories // Export directories for use in other files
};