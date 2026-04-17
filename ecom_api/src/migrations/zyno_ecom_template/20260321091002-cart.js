"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carts", {
      cart_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
      },
      total_items: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      sub_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      discount_amount: {
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
      grand_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
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
    await queryInterface.dropTable("carts");
  },
};