"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Wishlist extends Model {
        static associate(models) {
            Wishlist.belongsTo(models.UserModels, {
                foreignKey: "user_id",
                as: "user",
            });

            Wishlist.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
            });

            Wishlist.belongsTo(models.ProductVariant, {
                foreignKey: "product_variant_id",
                as: "variant",
            });
        }
    }

    Wishlist.init(
        {
            wishlist_id: {
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
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            product_variant_id: {
                type: DataTypes.UUID,
                allowNull: true,
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
            modelName: "Wishlist",
            tableName: "wishlists",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Wishlist;
};
