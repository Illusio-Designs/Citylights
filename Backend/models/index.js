const User = require('./User');
const Store = require('./Store');
const sequelize = require('../config/db');

// Define relationships
User.belongsTo(Store, { foreignKey: 'store_id' });
Store.hasMany(User, { foreignKey: 'store_id' });

module.exports = {
    sequelize,
    User,
    Store
}; 