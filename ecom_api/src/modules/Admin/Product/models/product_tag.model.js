"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductTag extends Model {
    static associate(models) {
      ProductTag.belongsTo(models.Tag, {
        foreignKey: "tag_id",
        targetKey: "tag_id",
        as: "tag",
      });

      ProductTag.belongsTo(models.Product, {
        foreignKey: "product_id",
        targetKey: "product_id",
        as: "product",
      });
    }
  }

  ProductTag.init(
    {
      product_tag_id: {
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
      tag_id: {
        type: DataTypes.UUID
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
      modelName: "ProductTag",
      tableName: "product_tags",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return ProductTag;
};
