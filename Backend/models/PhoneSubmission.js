const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PhoneSubmission = sequelize.define('PhoneSubmission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Where the submission came from (footer, contact page, etc.)'
    },
    status: {
        type: DataTypes.ENUM('pending', 'contacted', 'converted'),
        defaultValue: 'pending'
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
    tableName: 'phone_submissions',
    timestamps: false
});

module.exports = PhoneSubmission;