"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CouponUsage extends Model {
    static associate(models) {
      CouponUsage.belongsTo(models.CouponModels, {
        foreignKey: "coupon_id",
        as: "coupon",
      });
      CouponUsage.belongsTo(models.OrderModels, {
        foreignKey: "order_id",
        as: "order",
      });
      CouponUsage.belongsTo(models.UserModels, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  CouponUsage.init(
    {
      coupon_usage_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      coupon_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      coupon_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CouponUsageModels",
      tableName: "coupon_usages",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return CouponUsage;
};
