const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const karkunJoinRequestSchema = sequelize.define(
    "karkun_join_requests",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'karkun',
      },
      birth_year: {
        type: DataTypes.STRING(4), // YEAR not directly supported in Sequelize
        allowNull: false,
      },
      ehad_year: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "karkun_join_requests",
      timestamps: false,
      underscored: true,
    }
  );

  return karkunJoinRequestSchema;
};
