const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { upload } = require('../config/multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', sliderController.getSliders);
router.get('/:id', sliderController.getSliderById);

// Protected routes (require authentication)
router.post('/', authenticateToken, requireAdmin, upload.single('slider_image'), sliderController.createSlider);
router.put('/:id', authenticateToken, requireAdmin, upload.single('slider_image'), sliderController.updateSlider);
router.delete('/:id', authenticateToken, requireAdmin, sliderController.deleteSlider);

// Utility route for cleanup
router.post('/cleanup-missing-images', authenticateToken, requireAdmin, sliderController.cleanupMissingImages);

module.exports = router;