const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
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
 * @returns {Promise<string>} Path to compressed image
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

        return outputPath;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

module.exports = {
    upload,
    compressImage
};