"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("variant_option_values", {
      variant_option_value_id: {
        type: Sequelize.UUID,
        references: {
          model: "product_variants",
          key: "product_variant_id"
        },
        onDelete: "CASCADE",
        primaryKey: true,
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      option_value_id: {
        type: Sequelize.UUID,
        references: {
          model: "option_values",
          key: "option_value_id"
        },
        onDelete: "CASCADE",
        primaryKey: true,
      },
      product_variant_id: {
        type: Sequelize.UUID,
      },
      option_value_id: {
        type: Sequelize.UUID,
      },
      cost: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("variant_option_values");
  },
};
