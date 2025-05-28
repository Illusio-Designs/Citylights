const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ProductVariation = require('./ProductVariation');

const ProductImage = sequelize.define('ProductImage', {
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
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'product_images',
    timestamps: false
});

// Define association
ProductImage.belongsTo(ProductVariation, { foreignKey: 'variation_id' });
ProductVariation.hasMany(ProductImage, { foreignKey: 'variation_id' });

module.exports = ProductImage; 