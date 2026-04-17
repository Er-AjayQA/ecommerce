"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.ProductMedia, {
        foreignKey: "product_id",
        as: "media",
      });
      Product.hasMany(models.ProductVariant, {
        foreignKey: "product_id",
        as: "variants",
      });
      Product.hasMany(models.ProductOption, {
        foreignKey: "product_id",
        as: "options",
      });
      Product.hasMany(models.ProductTag, {
        foreignKey: "product_id",
        as: "tags",
      });
      Product.hasOne(models.ProductSEO, {
        foreignKey: "product_id",
        as: "seo",
      });
      Product.belongsTo(models.Vendor, {
        foreignKey: "vendor_id",
        targetKey: "vendor_id",
        as: "vendors",
      });
      Product.belongsTo(models.ProductType, {
        foreignKey: "product_type_id",
        as: "product_types",
      });
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
      Product.hasMany(models.CollectionProduct, {
        foreignKey: "product_id",
        as: "collectionProducts",
      });
    }
  }

  Product.init(
    {
      product_id: {
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
      title: {
        type: DataTypes.STRING
      },
      sku: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      vendor_id: {
        type: DataTypes.UUID
      },
      category_id: {
        type: DataTypes.UUID
      },
      product_type_id: {
        type: DataTypes.UUID
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
        type: DataTypes.ENUM("ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED", "ARCHIVED"),
        defaultValue: "DRAFT"
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  );

  return Product;
};
