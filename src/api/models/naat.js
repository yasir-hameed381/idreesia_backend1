const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

const naatsSchema = sequelize.define('naats', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true, 
  },
  title_en: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  title_ur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER(2),
    allowNull: true,
    defaultValue: null,
  },
  is_published: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  },
  track: {
    type: DataTypes.STRING(25),
    allowNull: true,
    defaultValue: null,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  filepath: {
    type: DataTypes.STRING(255),
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
    defaultValue: null,
  },
  updated_by: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'naats',
  timestamps: false,
  underscored: true,
});
return naatsSchema
}


