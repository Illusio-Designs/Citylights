const { PhoneSubmission } = require('../models');

// Submit phone number
const submitPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        // Validate required fields
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Create phone submission record
        const phoneSubmission = await PhoneSubmission.create({
            phone,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Phone number submitted successfully',
            data: phoneSubmission
        });
    } catch (error) {
        console.error('Error submitting phone:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit phone number',
            error: error.message
        });
    }
};

// Get all phone submissions (admin only)
const getAllPhoneSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;

        const submissions = await PhoneSubmission.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: submissions.rows,
            pagination: {
                total: submissions.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(submissions.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching phone submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch phone submissions',
            error: error.message
        });
    }
};

// Update phone submission status
const updatePhoneStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const submission = await PhoneSubmission.findByPk(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Phone submission not found'
            });
        }

        await submission.update({
            status,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Phone submission status updated successfully',
            data: submission
        });
    } catch (error) {
        console.error('Error updating phone submission status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update phone submission status',
            error: error.message
        });
    }
};

// Delete phone submission
const deletePhoneSubmission = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await PhoneSubmission.findByPk(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Phone submission not found'
            });
        }

        await submission.destroy();

        res.json({
            success: true,
            message: 'Phone submission deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting phone submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete phone submission',
            error: error.message
        });
    }
};

module.exports = {
    submitPhone,
    getAllPhoneSubmissions,
    updatePhoneStatus,
    deletePhoneSubmission
};