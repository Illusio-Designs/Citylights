const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ProductVariation = require('./ProductVariation');
const VariationValue = require('./VariationValue');

const VariationAttributeMap = sequelize.define('VariationAttributeMap', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ProductVariation,
            key: 'id'
        }
    },
    variation_value_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: VariationValue,
            key: 'id'
        }
    }
}, {
    tableName: 'variation_attribute_map',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['variation_id', 'variation_value_id']
        }
    ]
});

// Define associations
VariationAttributeMap.belongsTo(ProductVariation, { foreignKey: 'variation_id' });
ProductVariation.hasMany(VariationAttributeMap, { foreignKey: 'variation_id' });

VariationAttributeMap.belongsTo(VariationValue, { foreignKey: 'variation_value_id' });
VariationValue.hasMany(VariationAttributeMap, { foreignKey: 'variation_value_id' });

module.exports = VariationAttributeMap; 