const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const KhatFormToken = sequelize.define(
    "khat_form_tokens",
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
        defaultValue: null,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "khat_form_tokens",
      timestamps: false,
      underscored: true,
    }
  );

  KhatFormToken.associate = (models) => {
    KhatFormToken.belongsTo(models.zones, {
      foreignKey: 'zone_id',
      as: 'zone',
      onDelete: 'SET NULL',
    });
    KhatFormToken.belongsTo(models.mehfil_directories, {
      foreignKey: 'mehfil_directory_id',
      as: 'mehfilDirectory',
      onDelete: 'SET NULL',
    });
    KhatFormToken.belongsTo(models.users, {
      foreignKey: 'created_by',
      as: 'creator',
      onDelete: 'SET NULL',
    });
  };

  return KhatFormToken;
};

