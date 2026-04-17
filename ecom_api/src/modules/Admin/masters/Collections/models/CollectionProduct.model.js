"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CollectionProduct extends Model {
    static associate(models) {
      CollectionProduct.belongsTo(models.Collection, {
        foreignKey: "collection_id",
        targetKey: "collection_id",
        as: "collection",
      });
      CollectionProduct.belongsTo(models.Product, {
        foreignKey: "product_id",
        targetKey: "product_id",
        as: "product",
      });
    }
  }

  CollectionProduct.init(
    {
      collection_product_id: {
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
      collection_id: {
        type: DataTypes.UUID
      },
      product_id: {
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
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE"
      },
    },
    {
      sequelize,
      modelName: "CollectionProduct",
      tableName: "collection_products",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  );

  return CollectionProduct;
};
