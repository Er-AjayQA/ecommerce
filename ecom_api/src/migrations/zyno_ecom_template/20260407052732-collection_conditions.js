'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collection_conditions', {
      collection_condition_id: {
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
      title: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
      },
      algorithm: {
        type: Sequelize.STRING
      },
      values: {
        type: Sequelize.JSON
      },
      collection_id: {
        type: Sequelize.UUID,
        references: {
          model: "collections",
          key: "collection_id",
        },
        onDelete: "CASCADE",
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('collection_conditions');
  }
};