const { Appointment, Store } = require('../models');

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
            message: 'Failed to book appointment',
            error: error.message
        });
    }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, store_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (store_id) whereClause.store_id = store_id;

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: appointments.rows,
            pagination: {
                total: appointments.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(appointments.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
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
            message: 'Failed to update appointment status',
            error: error.message
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
            message: 'Failed to fetch appointment',
            error: error.message
        });
    }
};

// Get appointments by store (for store owners)
const getAppointmentsByStore = async (req, res) => {
    try {
        const { store_id } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { store_id };
        if (status) whereClause.status = status;

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: appointments.rows,
            pagination: {
                total: appointments.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(appointments.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching store appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch store appointments',
            error: error.message
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
            message: 'Failed to delete appointment',
            error: error.message
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