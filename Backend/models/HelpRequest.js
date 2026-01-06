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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('technical', 'product_info', 'order_support', 'general'),
        defaultValue: 'general'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
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
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
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