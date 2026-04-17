'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
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
      domain: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      email_id: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      mobile_number: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING
      },
      otp_expiry: {
        type: Sequelize.STRING
      },
      tenant_id: {
        type: Sequelize.UUID
      },
      tenant_user_id: {
        type: Sequelize.UUID
      },
      role_id: {
        type: Sequelize.UUID
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
    await queryInterface.dropTable('users');
  }
};