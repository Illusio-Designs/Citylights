const User = require('./User');
const Store = require('./Store');
const Collection = require('./Collection');
const Product = require('./Product');
const ProductVariation = require('./ProductVariation');
const VariationAttribute = require('./VariationAttribute');
const VariationValue = require('./VariationValue');
const VariationAttributeMap = require('./VariationAttributeMap');
const ProductImage = require('./ProductImage');
const sequelize = require('../config/db');

// Define relationships
User.belongsTo(Store, { foreignKey: 'store_id' });
Store.hasMany(User, { foreignKey: 'store_id' });

module.exports = {
    sequelize,
    User,
    Store,
    Collection,
    Product,
    ProductVariation,
    VariationAttribute,
    VariationValue,
    VariationAttributeMap,
    ProductImage
}; 