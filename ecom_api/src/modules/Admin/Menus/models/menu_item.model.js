"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    static associate(models) {
      MenuItem.belongsTo(models.Menu, {
        foreignKey: "menu_id",
        as: "menu",
      });

      MenuItem.belongsTo(models.MenuItem, {
        foreignKey: "parent_id",
        as: "parent",
      });

      MenuItem.hasMany(models.MenuItem, {
        foreignKey: "parent_id",
        as: "children",
      });
    }
  }

  MenuItem.init(
    {
      menu_item_id: {
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
      menu_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      menu_label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      menu_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isIn: [[1, 2, 3]],
        },
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
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
      modelName: "MenuItem",
      tableName: "menu_items",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return MenuItem;
};
