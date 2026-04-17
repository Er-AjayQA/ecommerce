"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      Menu.hasMany(models.MenuItem, {
        foreignKey: "menu_id",
        as: "menuItems",
      });
    }
  }

  Menu.init(
    {
      menu_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      order_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
        type: DataTypes.ENUM("DRAFT", "PUBLISHED"),
        defaultValue: "DRAFT",
      },
    },
    {
      sequelize,
      modelName: "Menu",
      tableName: "menus",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return Menu;
};
