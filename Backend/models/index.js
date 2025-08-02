const User = require('./User');
const Store = require('./Store');
const Collection = require('./Collection');
const Product = require('./Product');
const ProductVariation = require('./ProductVariation');
const VariationAttribute = require('./VariationAttribute');
const VariationValue = require('./VariationValue');
const VariationAttributeMap = require('./VariationAttributeMap');
const ProductImage = require('./ProductImage');
const Review = require('./Review');
const Slider = require('./Slider');
const Order = require('./Order');
const sequelize = require('../config/db');

// Define relationships
User.belongsTo(Store, { foreignKey: 'store_id' });
Store.hasMany(User, { foreignKey: 'store_id' });

// Review relationships
Review.belongsTo(Store, { foreignKey: 'store_id' });
Store.hasMany(Review, { foreignKey: 'store_id' });

Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id' });

// Slider and Collection association
Slider.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });
Collection.hasMany(Slider, { foreignKey: 'collection_id', as: 'sliders' });

// Order relationships
Order.belongsTo(User, { foreignKey: 'user_id', as: 'storeOwner' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

Order.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Order, { foreignKey: 'product_id', as: 'orders' });

Order.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

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
    ProductImage,
    Review,
    Slider,
    Order
}; 