"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: "product_id"
      });
      ProductVariant.hasMany(models.InventoryItem, {
        foreignKey: "product_variant_id"
      });
      ProductVariant.belongsToMany(models.OptionValue, {
        through: models.VariantOptionValue,
        foreignKey: "product_variant_id",
        otherKey: "option_value_id",
        as: "optionValues",
      });
    }
  }

  ProductVariant.init(
    {
      product_variant_id: {
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
        type: DataTypes.UUID
      },
      title: {
        type: DataTypes.STRING,
      },
      sku: {
        type: DataTypes.STRING
      },
      price: {
        type: DataTypes.STRING,
      },
      compare_price: {
        type: DataTypes.STRING,
      },
      cost: {
        type: DataTypes.STRING,
      },
      barcode: {
        type: DataTypes.STRING,
      },
      weight: {
        type: DataTypes.STRING,
      },
      inventory_quantity: {
        type: DataTypes.INTEGER
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
      modelName: "ProductVariant",
      tableName: "product_variants",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return ProductVariant;
};