"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShippingProfile extends Model {
    static associate(models) {
      ShippingProfile.belongsTo(models.Product, {
        foreignKey: "product_id"
      });
    }
  }

  ShippingProfile.init(
    {
      shipping_profile_id: {
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
      weight: {
        type: DataTypes.DECIMAL(12, 2)
      },
      country_of_origin: {
        type: DataTypes.STRING,
      },
      hs_code: {
        type: DataTypes.STRING,
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
      modelName: "ShippingProfile",
      tableName: "shipping_profiles",
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return ShippingProfile;
};