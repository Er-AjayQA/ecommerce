"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.UserModels, {
                foreignKey: "user_id",
                as: "user",
            });
            Order.belongsTo(models.AddressModels, {
                foreignKey: "shipping_address_id",
                as: "shipping_address",
            });
            Order.belongsTo(models.AddressModels, {
                foreignKey: "billing_address_id",
                as: "billing_address",
            });
            Order.hasMany(models.OrderItemModels, {
                foreignKey: "order_id",
                as: "order_items",
            });
            Order.hasMany(models.OrderTrackingEventModels, {
                foreignKey: "order_id",
                as: "tracking_events",
            });
            Order.hasOne(models.InvoiceModels, {
                foreignKey: "order_id",
                as: "invoice",
            });
            Order.belongsTo(models.CouponModels, {
                foreignKey: "coupon_id",
                as: "coupon",
            });
        }
    }

    Order.init(
        {
            order_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            order_number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                unique: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            cart_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            shipping_address_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            billing_address_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            sub_total: {
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
            discount_amount: {
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
            coupon_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            coupon_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tracking_number: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            payment_status: {
                type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
                defaultValue: "PENDING",
            },
            status: {
                type: DataTypes.ENUM("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"),
                defaultValue: "PENDING",
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
            modelName: "OrderModels",
            tableName: "orders",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Order;
};
