const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HelpRequest = sequelize.define('HelpRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    query: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Store name for reference'
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    resolution_notes: {
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
    tableName: 'help_requests',
    timestamps: false
});

module.exports = HelpRequest;