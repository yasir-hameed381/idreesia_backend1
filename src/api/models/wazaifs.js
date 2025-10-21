const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const wazaifsSchema = sequelize.define('wazaifs', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  title_en: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  title_ur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Creates an index for slug
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  created_by: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    defaultValue: 1,
  },
  updated_by: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'wazaifs',
  timestamps: false,
  underscored: true,
});
return wazaifsSchema
}







