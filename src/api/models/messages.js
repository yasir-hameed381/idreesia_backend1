const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const messagesSchema = sequelize.define('messages', {
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
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description_ur: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_published: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
  },
  at_top: {
    type: DataTypes.TINYINT(4),
    allowNull: true,
    defaultValue: null,
  },
  show_notice: {
    type: DataTypes.TINYINT(4),
    allowNull: true,
    defaultValue: null,
  },
  created_by: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  updated_by: {
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
  link_1_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_1_category_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_2_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_2_category_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_3_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_3_category_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_4_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  link_4_category_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
  wazaif_id: {
    type: DataTypes.SMALLINT(6),
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'messages',
  timestamps: false,
  underscored: true,
});

return messagesSchema;
}
