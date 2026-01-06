const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
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
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('quote', 'general', 'support'),
        defaultValue: 'general'
    },
    status: {
        type: DataTypes.ENUM('pending', 'contacted', 'resolved'),
        defaultValue: 'pending'
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'stores',
            key: 'id'
        }
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
    tableName: 'contacts',
    timestamps: false
});

module.exports = Contact;