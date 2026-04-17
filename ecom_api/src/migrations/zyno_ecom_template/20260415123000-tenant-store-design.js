"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tenant_store_design", {
      tenant_store_design_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      theme_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      layout_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      theme_config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      layout_config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      template_config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
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

  async down(queryInterface) {
    await queryInterface.dropTable("tenant_store_design");
  },
};
