const { Appointment, Store } = require('../models');
const { parsePagination, isValidEmail } = require('../utils/validators');

// Book an appointment
const bookAppointment = async (req, res) => {
    try {
        const { name, email, phone, inquiry, store_id, store_name } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !inquiry) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Create appointment record
        const appointment = await Appointment.create({
            name,
            email,
            phone,
            inquiry,
            store_id,
            store_name,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment'
        });
    }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
    try {
        const { page: rawPage, limit: rawLimit, status, store_id } = req.query;
        const { page, limit, offset } = parsePagination(rawPage, rawLimit);

        const whereClause = {};
        if (status) whereClause.status = status;
        if (store_id) whereClause.store_id = store_id;

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: appointments.rows,
            pagination: {
                total: appointments.count,
                page,
                limit,
                totalPages: Math.ceil(appointments.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments'
        });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, confirmed_date, notes } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        await appointment.update({
            status,
            confirmed_date,
            notes,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Appointment status updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment status'
        });
    }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointment'
        });
    }
};

// Get appointments by store (for store owners)
const getAppointmentsByStore = async (req, res) => {
    try {
        const { store_id } = req.params;

        // Admins can read any store; store owners only their own store
        if (req.user.userType !== 'admin' && String(req.user.storeId) !== String(store_id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const { page: rawPage, limit: rawLimit, status } = req.query;
        const { page, limit, offset } = parsePagination(rawPage, rawLimit);

        const whereClause = { store_id };
        if (status) whereClause.status = status;

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: appointments.rows,
            pagination: {
                total: appointments.count,
                page,
                limit,
                totalPages: Math.ceil(appointments.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching store appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch store appointments'
        });
    }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        await appointment.destroy();

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete appointment'
        });
    }
};

module.exports = {
    bookAppointment,
    getAllAppointments,
    updateAppointmentStatus,
    getAppointmentById,
    getAppointmentsByStore,
    deleteAppointment
};