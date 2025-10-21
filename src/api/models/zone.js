const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const zonesSchema = sequelize.define('zones', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  region_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    // autoIncrement: true,
    primaryKey: true,
  },
  title_en: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  title_ur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  country_en: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  country_ur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city_en: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city_ur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  co: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  primary_phone_number: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  secondary_phone_number: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'zones',
  timestamps: false,
  underscored: true,
});
return zonesSchema
}