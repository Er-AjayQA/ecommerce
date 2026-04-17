'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('category', {
      category_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        allowNull: false,
        primaryKey: true,
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      category_name: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
      },
      product_code: {
        type: Sequelize.STRING,
      },
      parent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      level: {
        type: Sequelize.INTEGER,
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
        defaultValue: 'ACTIVE',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('category');
  }
};