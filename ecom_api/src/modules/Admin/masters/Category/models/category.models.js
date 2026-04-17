'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Category, {
        foreignKey: "parent_id",
        as: "children"
      });

      Category.belongsTo(models.Category, {
        foreignKey: "parent_id",
        as: "parent"
      });
    }
  }
  Category.init(
    {
      category_id: {
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
      category_name: {
        type: DataTypes.STRING,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      product_code: {
        type: DataTypes.STRING,
      },
      parent_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [[1, 2, 3]]
        }
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
      modelName: 'Category',
      tableName: "category",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    });
  return Category;
};