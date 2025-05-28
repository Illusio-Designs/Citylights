const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Stores',
            key: 'id'
        }
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'Reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['store_id']
        },
        {
            fields: ['email']
        }
    ]
});

module.exports = Review; 