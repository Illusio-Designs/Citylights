const { HelpRequest, Store, User } = require('../models');

// Submit a help request
const submitHelpRequest = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone, 
            subject, 
            message, 
            category, 
            priority, 
            store_id 
        } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject, and message are required'
            });
        }

        // Create help request record
        const helpRequest = await HelpRequest.create({
            name,
            email,
            phone,
            subject,
            message,
            category: category || 'general',
            priority: priority || 'medium',
            store_id,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Help request submitted successfully',
            data: helpRequest
        });
    } catch (error) {
        console.error('Error submitting help request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit help request',
            error: error.message
        });
    }
};

// Get all help requests (admin only)
const getAllHelpRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, priority, store_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;
        if (priority) whereClause.priority = priority;
        if (store_id) whereClause.store_id = store_id;

        const helpRequests = await HelpRequest.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Store,
                    attributes: ['id', 'name', 'city']
                },
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'fullName', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: helpRequests.rows,
            pagination: {
                total: helpRequests.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(helpRequests.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching help requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch help requests',
            error: error.message
        });
    }
};

// Update help request status
const updateHelpRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to, resolution_notes } = req.body;

        const helpRequest = await HelpRequest.findByPk(id);
        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        await helpRequest.update({
            status,
            assigned_to,
            resolution_notes,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Help request status updated successfully',
            data: helpRequest
        });
    } catch (error) {
        console.error('Error updating help request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update help request status',
            error: error.message
        });
    }
};

// Get help request by ID
const getHelpRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const helpRequest = await HelpRequest.findByPk(id, {
            include: [
                {
                    model: Store,
                    attributes: ['id', 'name', 'city', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'fullName', 'email']
                }
            ]
        });

        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        res.json({
            success: true,
            data: helpRequest
        });
    } catch (error) {
        console.error('Error fetching help request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch help request',
            error: error.message
        });
    }
};

// Assign help request to user
const assignHelpRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        const helpRequest = await HelpRequest.findByPk(id);
        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        await helpRequest.update({
            assigned_to,
            status: 'in_progress',
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Help request assigned successfully',
            data: helpRequest
        });
    } catch (error) {
        console.error('Error assigning help request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign help request',
            error: error.message
        });
    }
};

module.exports = {
    submitHelpRequest,
    getAllHelpRequests,
    updateHelpRequestStatus,
    getHelpRequestById,
    assignHelpRequest
};