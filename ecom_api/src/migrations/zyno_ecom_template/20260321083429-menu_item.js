"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("menu_items", {
      menu_item_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      menu_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "menus",
          key: "menu_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      menu_label: {
        type: Sequelize.STRING,
      },
      menu_link: {
        type: Sequelize.STRING,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "menu_items",
          key: "menu_item_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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
        type: Sequelize.ENUM("DRAFT", "PUBLISHED"),
        defaultValue: "DRAFT",
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
    await queryInterface.dropTable("menu_items");
  },
};
