const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Collection = require('./Collection');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        },
        references: {
            model: Collection,
            key: 'id'
        }
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meta_desc: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (product, options) => {
            // Ensure collection_id is an integer
            if (product.id && typeof product.id === 'string') {
                const parsed = parseInt(product.collection_id, 10);
                if (!isNaN(parsed)) {
                    product.id = parsed;
                }
            }
        }
    }
});

// Define association
Product.belongsTo(Collection, { foreignKey: 'id' });
Collection.hasMany(Product, { foreignKey: 'id' });

module.exports = Product;