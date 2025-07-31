const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'phone_number'
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true // Allow null for Google-authenticated users
    },
    userType: {
        type: DataTypes.ENUM('admin', 'storeowner'),
        allowNull: false,
        field: 'user_type'
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'store_id'
    },
    profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'profile_image'
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'deleted'),
        defaultValue: 'active'
    },
    googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'google_id'
    },
    authProvider: {
        type: DataTypes.ENUM('local', 'google'),
        defaultValue: 'local',
        field: 'auth_provider'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
    },
    resetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_token'
    },
    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_token_expiry'
    }
}, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ]
});

module.exports = User; 