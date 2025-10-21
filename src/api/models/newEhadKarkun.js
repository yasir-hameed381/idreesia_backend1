const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NewEhad = sequelize.define(
    "new_ehads", // 👈 this is the model name key in `models`
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
      father_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      marfat: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mehfil_directory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
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
      tableName: "new_ehads",
      timestamps: false, // ✅ you already handle created_at / updated_at manually
      underscored: true,
    }
  );

  // Associations
  NewEhad.associate = (models) => {
    NewEhad.belongsTo(models.mehfil_directories, {
      foreignKey: "mehfil_directory_id",
      onDelete: "CASCADE",
    });

    NewEhad.belongsTo(models.zones, {
      foreignKey: "zone_id",
      onDelete: "CASCADE",
    });

    NewEhad.belongsTo(models.users, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "SET NULL",
    });

    NewEhad.belongsTo(models.users, {
      foreignKey: "updated_by",
      as: "updater",
      onDelete: "SET NULL",
    });
  };

  return NewEhad;
};
