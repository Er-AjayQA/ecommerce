"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderTrackingEvent extends Model {
    static associate(models) {
      OrderTrackingEvent.belongsTo(models.OrderModels, {
        foreignKey: "order_id",
        as: "order",
      });
    }
  }

  OrderTrackingEvent.init(
    {
      tracking_event_id: {
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
      },
      status: {
        type: DataTypes.ENUM("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      location: {
        type: DataTypes.STRING,
      },
      event_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
      },
      is_customer_visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "OrderTrackingEventModels",
      tableName: "order_tracking_events",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return OrderTrackingEvent;
};
