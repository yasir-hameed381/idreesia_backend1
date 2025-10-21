const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const mehfilsSchema = sequelize.define('mehfils', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
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
  time: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null,
  },
  is_published: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  },
  old: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'mehfils', 
  timestamps: false, 
  underscored: true, 
});
return mehfilsSchema;

}









