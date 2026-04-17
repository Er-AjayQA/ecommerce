"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.CouponUsageModels, {
        foreignKey: "coupon_id",
        as: "usages",
      });
    }
  }

  Coupon.init(
    {
      coupon_id: {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      discount_type: {
        type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
        allowNull: false,
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      usage_limit_per_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      starts_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ends_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE", "EXPIRED"),
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
      modelName: "CouponModels",
      tableName: "coupons",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Coupon;
};
