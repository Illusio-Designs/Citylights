const { Contact, Store } = require('../models');
const { parsePagination, isValidEmail } = require('../utils/validators');

// Submit a contact/quote request
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Create contact record
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
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
            message: 'Failed to submit contact request'
        });
    }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
    try {
        const { page: rawPage, limit: rawLimit, status } = req.query;
        const { page, limit, offset } = parsePagination(rawPage, rawLimit);

        const whereClause = {};
        if (status) whereClause.status = status;

        const contacts = await Contact.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: contacts.rows,
            pagination: {
                total: contacts.count,
                page,
                limit,
                totalPages: Math.ceil(contacts.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
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
            message: 'Failed to update contact status'
        });
    }
};

// Get contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByPk(id);

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
            message: 'Failed to fetch contact'
        });
    }
};

// Delete contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.destroy();

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact'
        });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    updateContactStatus,
    getContactById,
    deleteContact
};