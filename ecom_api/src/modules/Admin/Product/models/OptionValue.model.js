//5

"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  class OptionValue extends Model {
    static associate(models) {
      OptionValue.belongsTo(models.ProductOption, {
        foreignKey: "product_option_id",
      });
      OptionValue.belongsToMany(models.ProductVariant, {
        through: models.VariantOptionValue,
        foreignKey: "option_value_id",
        otherKey: "product_variant_id",
        as: "variants",
      });
    }
  }

  OptionValue.init(
    {
      option_value_id: {
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
      product_option_id: {
        type: DataTypes.UUID
      },
      value: {
        type: DataTypes.STRING
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
      modelName: "OptionValue",
      tableName: "option_values",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return OptionValue;
};