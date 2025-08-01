const { Review, Store, Product } = require('../models');

// Get all reviews (admin - shows all including pending)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                {
                    model: Store,
                    attributes: ['name']
                },
                {
                    model: Product,
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews by store ID (public - only approved reviews)
exports.getReviewsByStore = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { 
                store_id: req.params.storeId,
                status: 'approved'
            },
            include: [{
                model: Store,
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']]
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
            include: [
                {
                    model: Store,
                    attributes: ['name']
                },
                {
                    model: Product,
                    attributes: ['name']
                }
            ]
        });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews by product ID (public - only approved reviews)
exports.getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { 
                product_id: req.params.productId,
                status: 'approved'
            },
            include: [
                {
                    model: Product,
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new review (public - always creates as pending)
exports.createReview = async (req, res) => {
    try {
        const { store_id, product_id, username, email, phone_number, message, rating } = req.body;

        // Validate required fields
        if ((!store_id && !product_id) || !username || !email || !phone_number || !message) {
            return res.status(400).json({ message: 'All fields are required, and either store_id or product_id must be provided' });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
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
            message,
            rating: rating || null,
            status: 'pending' // Always create as pending
        });

        res.status(201).json({
            ...review.toJSON(),
            message: 'Review submitted successfully! It will be visible after admin approval.'
        });
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

        const { username, email, phone_number, message, rating, status } = req.body;

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Validate status if provided
        if (status && !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        await review.update({
            username: username || review.username,
            email: email || review.email,
            phone_number: phone_number || review.phone_number,
            message: message || review.message,
            rating: rating || review.rating,
            status: status || review.status
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

// Approve review (admin only)
exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.update({ status: 'approved' });
        res.json({ 
            message: 'Review approved successfully',
            review: review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject review (admin only)
exports.rejectReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.update({ status: 'rejected' });
        res.json({ 
            message: 'Review rejected successfully',
            review: review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending reviews (admin only)
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: Store,
                    attributes: ['name']
                },
                {
                    model: Product,
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 