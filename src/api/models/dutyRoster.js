const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DutyRoster = sequelize.define(
    "duty_rosters",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      region_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      mehfil_directory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      duty_type_id_monday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_tuesday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_wednesday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_thursday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_friday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_saturday: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      duty_type_id_sunday: {
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
      tableName: "duty_rosters",
      timestamps: false,
      underscored: true,
    }
  );

  // Associations
  DutyRoster.associate = (models) => {
    DutyRoster.belongsTo(models.zones, {
      foreignKey: "zone_id",
      onDelete: "SET NULL",
    });

    DutyRoster.belongsTo(models.mehfil_directories, {
      foreignKey: "mehfil_directory_id",
      onDelete: "SET NULL",
    });

    DutyRoster.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    DutyRoster.belongsTo(models.users, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "SET NULL",
    });

    DutyRoster.belongsTo(models.users, {
      foreignKey: "updated_by",
      as: "updater",
      onDelete: "SET NULL",
    });

    // Assignment relationship
    if (models.duty_roster_assignments) {
      DutyRoster.hasMany(models.duty_roster_assignments, {
        foreignKey: "duty_roster_id",
        as: "assignments",
        onDelete: "CASCADE",
      });
    }
  };

  return DutyRoster;
};


