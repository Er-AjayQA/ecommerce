"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InventoryItem extends Model {
    static associate(models) {
      InventoryItem.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id"
      });
      InventoryItem.hasMany(models.InventoryLevel, {
        foreignKey: "inventory_item_id"
      });
      InventoryItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        targetKey: "product_id",
        as: "product",
      });
    }
  }

  InventoryItem.init(
    {
      inventory_item_id: {
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
      product_id: {
        type: DataTypes.UUID,
      },
      product_variant_id: {
        type: DataTypes.UUID
      },
      available_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reserved_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sku: {
        type: DataTypes.STRING
      },
      tracked: {
        type: DataTypes.BOOLEAN
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
        defaultValue: "ACTIVE"
      },
    },
    {
      sequelize,
      modelName: "InventoryItem",
      tableName: "inventory_items",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  return InventoryItem;
};