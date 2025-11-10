const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DutyType = sequelize.define(
    "duty_types",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_editable: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.BIGINT.UNSIGNED,
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
      tableName: "duty_types",
      timestamps: false,
      underscored: true,
    }
  );

  // Associations
  DutyType.associate = (models) => {
    DutyType.belongsTo(models.zones, {
      foreignKey: "zone_id",
      onDelete: "CASCADE",
    });

    DutyType.belongsTo(models.users, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "SET NULL",
    });

    DutyType.belongsTo(models.users, {
      foreignKey: "updated_by",
      as: "updater",
      onDelete: "SET NULL",
    });
  };

  return DutyType;
};


