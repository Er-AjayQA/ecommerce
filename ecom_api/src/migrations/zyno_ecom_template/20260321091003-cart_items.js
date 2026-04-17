"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cart_items", {
      cart_item_id: {
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
      cart_id: {
        type: Sequelize.UUID,
      },
      product_id: {
        type: Sequelize.UUID,
      },
      product_variant_id: {
        type: Sequelize.UUID,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      final_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      line_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_selected: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

  async down(queryInterface) {
    await queryInterface.dropTable("cart_items");
  },
};