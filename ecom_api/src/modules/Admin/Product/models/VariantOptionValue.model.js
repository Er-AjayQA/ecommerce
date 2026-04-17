"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VariantOptionValue extends Model {
    static associate(models) {
      VariantOptionValue.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
      });
      VariantOptionValue.belongsTo(models.OptionValue, {
        foreignKey: "option_value_id",
      });
    }
  }

  VariantOptionValue.init(
    {
      variant_option_value_id: {
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
      product_variant_id: {
        type: DataTypes.UUID,
      },
      option_value_id: {
        type: DataTypes.UUID,
      },
      cost: {
        type: DataTypes.STRING,
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
      modelName: "VariantOptionValue",
      tableName: "variant_option_values",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return VariantOptionValue;
};
