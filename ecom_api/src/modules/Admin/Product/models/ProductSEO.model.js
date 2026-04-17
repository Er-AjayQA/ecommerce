"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductSEO extends Model {
    static associate(models) {
      ProductSEO.belongsTo(models.Product, {
        foreignKey: "product_id"
      });
    }
  }

  ProductSEO.init(
    {
      product_seo_id: {
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
      slug: {
        type: DataTypes.STRING
      },
      seo_title: {
        type: DataTypes.STRING
      },
      seo_description: {
        type: DataTypes.TEXT
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
      modelName: "ProductSEO",
      tableName: "product_seo",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    });

  return ProductSEO;
};