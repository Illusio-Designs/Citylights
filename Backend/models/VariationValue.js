const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const VariationAttribute = require('./VariationAttribute');

const VariationValue = sequelize.define('VariationValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variation_attr_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: VariationAttribute,
            key: 'id'
        }
    },
    value: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'variation_values',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['variation_attr_id', 'value']
        }
    ]
});

// Define association
VariationValue.belongsTo(VariationAttribute, { foreignKey: 'variation_attr_id' });
VariationAttribute.hasMany(VariationValue, { foreignKey: 'variation_attr_id' });

module.exports = VariationValue; 