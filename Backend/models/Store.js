const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    whatsapp_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL or path to store logo'
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of image URLs or paths'
    },
    map_location_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Google Maps or other map service URL'
    },
    shop_timings: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Store operating hours (e.g., "10:00 AM - 8:00 PM")'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    }
}, {
    tableName: 'Stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['email']
        }
    ]
});

module.exports = Store; 