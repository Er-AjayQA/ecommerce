"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    static associate(models) {
      Collection.hasMany(models.CollectionProduct, {
        foreignKey: "collection_id",
        as: "products",
      });
      Collection.hasMany(models.CollectionConditions, {
        foreignKey: "collection_id",
        as: "conditions",
      });
      Collection.hasMany(models.CollectionMedia, {
        foreignKey: "collection_id",
        as: "media",
      });
    }
  }

  Collection.init(
    {
      collection_id: {
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
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT
      },
      condition_apply_type: {
        type: DataTypes.ENUM("ALL", "ANY"),
        defaultValue: "ALL"
      },
      collection_type: {
        type: DataTypes.ENUM("MANUAL", "SMART"),
        defaultValue: "MANUAL"
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
        type: DataTypes.ENUM("DRAFT", "PUBLISHED"),
        defaultValue: "DRAFT"
      },
    },
    {
      sequelize,
      modelName: "Collection",
      tableName: "collections",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return Collection;
};
