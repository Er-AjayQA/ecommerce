"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.UserModels, {
        foreignKey: "user_id",
        as: "user",
      });
      Notification.belongsTo(models.OrderModels, {
        foreignKey: "order_id",
        as: "order",
      });
    }
  }

  Notification.init(
    {
      notification_id: {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM("EMAIL", "SMS", "IN_APP"),
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING,
      },
      subject: {
        type: DataTypes.STRING,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      template_key: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "SENT", "FAILED", "SKIPPED"),
        defaultValue: "PENDING",
      },
      provider_response: {
        type: DataTypes.TEXT,
      },
      error_message: {
        type: DataTypes.TEXT,
      },
      sent_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "NotificationModels",
      tableName: "notifications",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Notification;
};
