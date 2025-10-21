const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tabarukat = sequelize.define(
    "tabarukats",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      co_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      mehfil_directory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
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
      tableName: "tabarukats",
      timestamps: false, // we are using created_at, updated_at manually
      underscored: true, // match snake_case columns
    }
  );

  // Associations
  Tabarukat.associate = (models) => {
    Tabarukat.belongsTo(models.mehfil_directories, {
      foreignKey: "mehfil_directory_id",
      onDelete: "CASCADE",
    });

    Tabarukat.belongsTo(models.zones, {
      foreignKey: "zone_id",
      onDelete: "CASCADE",
    });
  };

  return Tabarukat;
};
