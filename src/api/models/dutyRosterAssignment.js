const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DutyRosterAssignment = sequelize.define(
    "duty_roster_assignments",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      duty_roster_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      duty_type_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      day: {
        type: DataTypes.ENUM(
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ),
        allowNull: false,
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
      tableName: "duty_roster_assignments",
      timestamps: false,
      underscored: true,
    }
  );

  // Associations
  DutyRosterAssignment.associate = (models) => {
    DutyRosterAssignment.belongsTo(models.duty_rosters, {
      foreignKey: "duty_roster_id",
      as: "dutyRoster",
      onDelete: "CASCADE",
    });

    DutyRosterAssignment.belongsTo(models.duty_types, {
      foreignKey: "duty_type_id",
      as: "dutyType",
      onDelete: "CASCADE",
    });
  };

  return DutyRosterAssignment;
};


