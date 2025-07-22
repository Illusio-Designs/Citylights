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
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    collection_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Collection,
            key: 'id'
        }
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
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
    updatedAt: 'updated_at'
});

// Define association
Product.belongsTo(Collection, { foreignKey: 'collection_id' });
Collection.hasMany(Product, { foreignKey: 'collection_id' });

module.exports = Product; 