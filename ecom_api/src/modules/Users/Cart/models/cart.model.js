"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            Cart.belongsTo(models.UserModels, {
                foreignKey: "user_id",
                as: "user",
            });

            Cart.hasMany(models.CartItemModels, {
                foreignKey: "cart_id",
                as: "cart_items",
            });
        }
    }

    Cart.init(
        {
            cart_id: {
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
            },
            total_items: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            sub_total: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            discount_amount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            tax_amount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            shipping_amount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            grand_total: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
            },
            applied_coupon_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            applied_coupon_code: {
                type: DataTypes.STRING,
                allowNull: true,
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
            modelName: "Cart",
            tableName: "carts",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Cart;
};
