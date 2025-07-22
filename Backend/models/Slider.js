const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Collection = require('./Collection');

const Slider = sequelize.define('Slider', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    collection_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Collection,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    button_text: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Filename of the slider image'
    }
}, {
    tableName: 'Sliders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Slider; 