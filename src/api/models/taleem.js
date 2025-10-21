const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const taleemsSchema = sequelize.define('taleems', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        title_en: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        title_ur: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        track: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_published: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        filepath: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
    }, {
        tableName: 'taleems',
        timestamps: false,
        underscored: true,
    });
    
    return taleemsSchema;

};

