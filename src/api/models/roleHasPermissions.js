const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoleHasPermissions = sequelize.define(
    "role_has_permissions",
    {
      role_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permission_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "permissions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "role_has_permissions",
      timestamps: false,
      underscored: true,
    }
  );

  return RoleHasPermissions;
};
