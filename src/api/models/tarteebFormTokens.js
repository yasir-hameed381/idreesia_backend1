const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TarteebFormToken = sequelize.define(
    "tarteeb_form_tokens",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      mehfil_directory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      used: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
      tableName: "tarteeb_form_tokens",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["token"],
        },
        {
          fields: ["expires_at"],
        },
      ],
    }
  );

  return TarteebFormToken;
};

