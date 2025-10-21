const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const permissionsSchema = sequelize.define(
    "permissions",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      guard_name: {
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
      },
    },
    {
      tableName: "permissions",
      timestamps: false,
      underscored: true,
    }
  );

  return permissionsSchema;
};
