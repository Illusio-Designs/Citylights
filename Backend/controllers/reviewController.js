const { Review, Store, Product } = require('../models');

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{
                model: Store,
                attributes: ['name']
            }]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews by store ID
exports.getReviewsByStore = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { store_id: req.params.storeId },
            include: [{
                model: Store,
                attributes: ['name']
            }]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, {
            include: [{
                model: Store,
                attributes: ['name']
            }]
        });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews by product ID
exports.getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { product_id: req.params.productId }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new review
exports.createReview = async (req, res) => {
    try {
        const { store_id, product_id, username, email, phone_number, message } = req.body;

        // Validate required fields
        if ((!store_id && !product_id) || !username || !email || !phone_number || !message) {
            return res.status(400).json({ message: 'All fields are required, and either store_id or product_id must be provided' });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if store or product exists
        if (store_id) {
            const store = await Store.findByPk(store_id);
            if (!store) {
                return res.status(404).json({ message: 'Store not found' });
            }
        }
        if (product_id) {
            const product = await Product.findByPk(product_id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
        }

        const review = await Review.create({
            store_id: store_id || null,
            product_id: product_id || null,
            username,
            email,
            phone_number,
            message
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const { username, email, phone_number, message } = req.body;

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        await review.update({
            username: username || review.username,
            email: email || review.email,
            phone_number: phone_number || review.phone_number,
            message: message || review.message
        });

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.destroy();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 