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
    profile: path.join(__dirname, '../uploads/profile'),
    sliders: path.join(__dirname, '../uploads/sliders'),
    seo: path.join(__dirname, '../uploads/seo')
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
            case 'store_logo': // For backward compatibility
                dest = directories.logos;
                break;
            case 'collection_image':
            case 'image': // For backward compatibility
                dest = directories.collections;
                break;
            case 'product_image':
            case 'productImage': // For backward compatibility
                dest = directories.products;
                break;
            case 'profile_image':
            case 'profileImage': // For backward compatibility
                dest = directories.profile;
                break;
            case 'store_image':
            case 'storeImage': // For backward compatibility
            case 'images': // For backward compatibility
                dest = directories.images;
                break;
            case 'slider_image':
                dest = directories.sliders;
                break;
            case 'meta_image':
                dest = directories.seo;
                break;
            default:
                // Handle variation images (variation_images[0], variation_images[1], etc.)
                if (file.fieldname.startsWith('variation_images[')) {
                    dest = directories.products;
                } else {
                    dest = directories.images;
                }
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
        fileSize: 20 * 1024 * 1024 // 20MB limit
    }
});

/**
 * Compress and resize image
 * @param {string} inputPath - Path to input image
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Filename of compressed image
 */
async function compressImage(inputPath, options = {}) {
    const defaultOptions = {
        width: 800, // Default width
        height: 800, // Default height
        quality: 80, // Default quality
        format: 'webp' // Changed to WebP format for better compression
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        // Create WebP filename by changing extension
        const parsedPath = path.parse(inputPath);
        const webpPath = path.join(parsedPath.dir, parsedPath.name + '.webp');
        
        // Compress to WebP format
        await sharp(inputPath)
            .resize(finalOptions.width, finalOptions.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: finalOptions.quality })
            .toFile(webpPath);

        // Delete original file
        fs.unlinkSync(inputPath);

        // Return only the WebP filename, not the full path
        return path.basename(webpPath);
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