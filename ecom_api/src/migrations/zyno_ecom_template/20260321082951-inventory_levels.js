"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventory_levels", {
      inventory_level_id: {
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
      inventory_item_id: {
        type: Sequelize.UUID,
        references: {
          model: "inventory_items",
          key: "inventory_item_id"
        },
        onDelete: "CASCADE",
      },
      location_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable("inventory_levels");
  },
};