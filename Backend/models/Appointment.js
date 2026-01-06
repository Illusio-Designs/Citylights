const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preferred_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    preferred_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    service_type: {
        type: DataTypes.ENUM('consultation', 'showroom_visit', 'home_visit', 'design_consultation'),
        defaultValue: 'consultation'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    confirmed_date: {
        type: DataTypes.DATETIME,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'appointments',
    timestamps: false
});

module.exports = Appointment;