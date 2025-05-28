const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VariationAttribute = sequelize.define('VariationAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'variation_attributes',
    timestamps: false
});

module.exports = VariationAttribute; 