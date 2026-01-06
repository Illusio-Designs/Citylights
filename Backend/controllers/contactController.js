const { Contact, Store } = require('../models');

// Submit a contact/quote request
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, company, message, type, store_id } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Create contact record
        const contact = await Contact.create({
            name,
            email,
            phone,
            company,
            message,
            type: type || 'general',
            store_id,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Contact request submitted successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error submitting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact request',
            error: error.message
        });
    }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const contacts = await Contact.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Store,
                    attributes: ['id', 'name', 'city']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: contacts.rows,
            pagination: {
                total: contacts.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(contacts.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: error.message
        });
    }
};

// Update contact status
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.update({
            status,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status',
            error: error.message
        });
    }
};

// Get contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByPk(id, {
            include: [
                {
                    model: Store,
                    attributes: ['id', 'name', 'city', 'phone', 'email']
                }
            ]
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact',
            error: error.message
        });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    updateContactStatus,
    getContactById
};