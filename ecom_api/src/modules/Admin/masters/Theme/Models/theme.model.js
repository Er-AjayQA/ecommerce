"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Theme extends Model {
        static associate(models) {

        }
    }

    Theme.init(
        {
            theme_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            order_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                unique: true,
            },
            theme_name: {
                type: DataTypes.STRING
            },
            description: {
                type: DataTypes.STRING
            },
            preview: {
                type: DataTypes.STRING
            },
            config: {
                type: DataTypes.JSON
            },
            is_default: {
                type: DataTypes.STRING
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
                defaultValue: "ACTIVE",
            },
        },
        {
            sequelize,
            modelName: "Theme",
            tableName: "themes",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Theme;
};