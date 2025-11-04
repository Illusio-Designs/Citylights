const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Seo = sequelize.define('Seo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  path: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  title: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  keywords: { type: DataTypes.TEXT, allowNull: true },
  og_title: { type: DataTypes.STRING(255), allowNull: true },
  og_description: { type: DataTypes.TEXT, allowNull: true },
  og_image: { type: DataTypes.STRING(512), allowNull: true },
  noindex: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'Seos',
  underscored: true,
});

module.exports = Seo;


