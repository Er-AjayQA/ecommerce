"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.OrderModels, {
                foreignKey: "order_id",
                as: "order",
            });
            OrderItem.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
            });
            OrderItem.belongsTo(models.ProductVariant, {
                foreignKey: "product_variant_id",
                as: "variant",
            });
        }
    }

    OrderItem.init(
        {
            order_item_id: {
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
            order_id: {
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
            quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            unit_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            line_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
            },
            status: {
                type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
                defaultValue: "ACTIVE",
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "OrderItemModels",
            tableName: "order_items",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return OrderItem;
};
