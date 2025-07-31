const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const ProductVariation = sequelize.define('ProductVariation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        },
        references: {
            model: Product,
            key: 'id'
        }
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    usecase: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'product_variations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (variation, options) => {
            // Ensure product_id is an integer
            if (variation.product_id && typeof variation.product_id === 'string') {
                const parsed = parseInt(variation.product_id, 10);
                if (!isNaN(parsed)) {
                    variation.product_id = parsed;
                }
            }
            
            // Ensure price is a valid decimal
            if (variation.price && typeof variation.price === 'string') {
                const parsed = parseFloat(variation.price);
                if (!isNaN(parsed)) {
                    variation.price = parsed;
                }
            }
            
            // Trim SKU
            if (variation.sku && typeof variation.sku === 'string') {
                variation.sku = variation.sku.trim();
            }
        }
    }
});

// Define association
ProductVariation.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductVariation, { foreignKey: 'product_id' });

module.exports = ProductVariation;