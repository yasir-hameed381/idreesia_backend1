const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResponseTemplate = sequelize.define(
    "response_templates",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      jawab: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      jawab_links: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "response_templates",
      timestamps: false,
      underscored: true,
    }
  );

  return ResponseTemplate;
};

