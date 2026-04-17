"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    static associate(models) {
      ProductCategory.belongsTo(models.Product, {
        foreignKey: "product_id",
      });
      ProductCategory.belongsTo(models.Category, {
        foreignKey: "category_id",
      });
    }
  }

  ProductCategory.init(
    {
      product_category_id: {
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
      category_id: {
        type: DataTypes.UUID,
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
      modelName: "ProductCategory",
      tableName: "product_categories",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return ProductCategory;
};
