"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class CollectionMedia extends Model {
        static associate(models) {
            CollectionMedia.belongsTo(models.Collection, {
                foreignKey: "collection_id",
                as: "collection",
            });
        }
    }

    CollectionMedia.init(
        {
            collection_media_id: {
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
            collection_id: {
                type: DataTypes.UUID
            },
            url: {
                type: DataTypes.TEXT
            },
            type: {
                type: DataTypes.STRING
            },
            position: {
                type: DataTypes.INTEGER
            },
            code: {
                type: DataTypes.STRING,
                unique: true
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
                defaultValue: "ACTIVE"
            },
        },
        {
            sequelize,
            modelName: "CollectionMedia",
            tableName: "collection_media",
            timestamps: true,
            freezeTableName: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    return CollectionMedia;
};