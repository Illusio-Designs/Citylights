const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { upload } = require('../config/multer');

// Public routes
router.get('/', sliderController.getSliders);
router.get('/:id', sliderController.getSliderById);

// Protected routes (require authentication)
router.post('/', upload.single('slider_image'), sliderController.createSlider);
router.put('/:id', upload.single('slider_image'), sliderController.updateSlider);
router.delete('/:id', sliderController.deleteSlider);

// Utility route for cleanup
router.post('/cleanup-missing-images', sliderController.cleanupMissingImages);

module.exports = router;