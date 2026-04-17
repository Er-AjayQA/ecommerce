"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("collection_media", {
      collection_media_id: {
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
      collection_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "collections",
          key: "collection_id",
        },
        onDelete: "CASCADE",
      },
      url: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.STRING
      },
      position: {
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
    await queryInterface.dropTable("collection_media");
  },
};