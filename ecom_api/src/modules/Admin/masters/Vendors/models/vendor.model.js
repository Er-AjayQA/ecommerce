"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    static associate(models) {

    }
  }

  Vendor.init(
    {
      vendor_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      vendor_name: {
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
      modelName: "Vendor",
      tableName: "vendors",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return Vendor;
};
