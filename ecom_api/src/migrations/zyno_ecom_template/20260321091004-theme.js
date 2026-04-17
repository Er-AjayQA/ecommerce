"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("themes", {
      theme_id: {
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
      theme_name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      preview: {
        type: Sequelize.STRING
      },
      config: {
        type: Sequelize.JSON
      },
      is_default: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable("themes");
  },
};