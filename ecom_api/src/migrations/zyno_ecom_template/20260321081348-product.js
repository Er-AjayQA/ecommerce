"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      product_id: {
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
      sku: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
      },
      vendor_id: {
        type: Sequelize.UUID,
        references: {
          model: "vendors",
          key: "vendor_id",
        },
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.UUID,
        references: {
          model: "category",
          key: "category_id",
        },
        onDelete: "CASCADE",
      },
      product_type_id: {
        type: Sequelize.UUID,
        references: {
          model: "product_types",
          key: "product_type_id",
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
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED", "ARCHIVED"),
        defaultValue: "DRAFT"
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
    await queryInterface.dropTable("products");
  },
};
