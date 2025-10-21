const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const tagSchema = sequelize.define(
    'taggable_tags',
    {
      tag_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      normalized: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'taggable_tags', // Set the table name explicitly
      timestamps: false, // Prevent Sequelize from adding createdAt/updatedAt fields automatically
    }
  );

  return tagSchema;
}
   