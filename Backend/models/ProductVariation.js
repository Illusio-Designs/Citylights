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
        references: {
            model: Product,
            key: 'id'
        }
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    usecase: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'product_variations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define association
ProductVariation.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductVariation, { foreignKey: 'product_id' });

module.exports = ProductVariation; 