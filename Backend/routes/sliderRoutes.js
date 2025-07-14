const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { upload } = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', sliderController.getSliders);
router.get('/:id', sliderController.getSliderById);

// Protected routes (require authentication)
router.post('/', authenticateToken, upload.single('slider_image'), sliderController.createSlider);
router.put('/:id', authenticateToken, upload.single('slider_image'), sliderController.updateSlider);
router.delete('/:id', authenticateToken, sliderController.deleteSlider);

module.exports = router; 