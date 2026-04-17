"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.OrderModels, {
        foreignKey: "order_id",
        as: "order",
      });
      Invoice.belongsTo(models.UserModels, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Invoice.init(
    {
      invoice_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      currency_code: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
      invoice_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATE,
      },
      sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      shipping_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      grand_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      billing_snapshot: {
        type: DataTypes.JSON,
      },
      shipping_snapshot: {
        type: DataTypes.JSON,
      },
      line_items_snapshot: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("GENERATED", "VOID"),
        defaultValue: "GENERATED",
      },
    },
    {
      sequelize,
      modelName: "InvoiceModels",
      tableName: "invoices",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Invoice;
};
