"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventory_items", {
      inventory_item_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: "products",
          key: "product_id"
        },
        onDelete: "CASCADE",
      },
      product_variant_id: {
        type: Sequelize.UUID,
        references: {
          model: "product_variants",
          key: "product_variant_id"
        },
        onDelete: "CASCADE",
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reserved_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      sku: {
        type: Sequelize.STRING
      },
      tracked: {
        type: Sequelize.BOOLEAN
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
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("inventory_items");
  },
};