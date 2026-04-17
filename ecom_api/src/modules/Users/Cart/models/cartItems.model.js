"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.CartModels, {
        foreignKey: "cart_id",
        as: "cart",
      });

      CartItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });

      CartItem.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        as: "variant",
      });
    }
  }

  CartItem.init(
    {
      cart_item_id: {
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
      cart_id: {
        type: DataTypes.UUID,
      },
      product_id: {
        type: DataTypes.UUID,
      },
      product_variant_id: {
        type: DataTypes.UUID,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      final_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      line_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      modelName: "CartItem",
      tableName: "cart_items",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return CartItem;
};