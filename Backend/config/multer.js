const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Define all required directories (flat structure)
const directories = {
    collections: path.join(__dirname, '../uploads/collections'),
    products: path.join(__dirname, '../uploads/products'),
    images: path.join(__dirname, '../uploads/images'),
    logos: path.join(__dirname, '../uploads/logos'),
    profile: path.join(__dirname, '../uploads/profile')
};

// Create all required directories
Object.values(directories).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine which directory to use based on field name
        let dest;
        switch (file.fieldname) {
            case 'logo':
                dest = directories.logos;
                break;
            case 'collection_image':
                dest = directories.collections;
                break;
            case 'product_image':
                dest = directories.products;
                break;
            case 'profile':
                dest = directories.profile;
                break;
            default:
                dest = directories.images;
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
 * Compress and resize image (overwrite original file)
 * @param {string} inputPath - Path to input image
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Filename of compressed image
 */
async function compressImage(inputPath, options = {}) {
    const defaultOptions = {
        width: 800, // Default width
        height: 800, // Default height
        quality: 80, // Default quality
        format: 'jpeg' // Default format
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        await sharp(inputPath)
            .resize(finalOptions.width, finalOptions.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat(finalOptions.format, { quality: finalOptions.quality })
            .toFile(inputPath); // Overwrite original file

        // Return only the filename, not the full path
        return path.basename(inputPath);
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