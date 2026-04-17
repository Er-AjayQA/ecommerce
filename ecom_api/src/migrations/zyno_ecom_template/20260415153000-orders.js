"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      order_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      cart_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      shipping_address_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      billing_address_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      sub_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      grand_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
      },
      payment_status: {
        type: Sequelize.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
      },
      status: {
        type: Sequelize.ENUM("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"),
        defaultValue: "PENDING",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
  },
};
