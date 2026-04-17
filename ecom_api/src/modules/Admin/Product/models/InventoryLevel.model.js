"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InventoryLevel extends Model {
    static associate(models) {
      InventoryLevel.belongsTo(models.InventoryItem, {
        foreignKey: "inventory_item_id"
      });
    }
  }

  InventoryLevel.init(
    {
      inventory_level_id: {
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
      inventory_item_id: {
        type: DataTypes.UUID
      },
      location_id: {
        type: DataTypes.UUID
      },
      quantity: {
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
      modelName: "InventoryLevel",
      tableName: "inventory_levels",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return InventoryLevel;
};