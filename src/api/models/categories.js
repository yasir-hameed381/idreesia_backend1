const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const categoriesSchema = sequelize.define('categories', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, // Index is typically created for unique fields
    },
    title_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title_ur: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date()
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date()
    },
  }, {
    tableName: 'categories',
    timestamps: false,
  });

return categoriesSchema;
}
