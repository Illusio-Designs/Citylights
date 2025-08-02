const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

async function createOrdersTable() {
    try {
        await sequelize.getQueryInterface().createTable('Orders', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            order_number: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending'
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            admin_notes: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            approved_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            approved_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });

        console.log('Orders table created successfully');
        return true;
    } catch (error) {
        console.error('Error creating Orders table:', error);
        return false;
    }
}

module.exports = { createOrdersTable }; 