"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("carts", "applied_coupon_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("carts", "applied_coupon_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "coupon_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "coupon_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "tracking_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.createTable("coupons", {
      coupon_id: {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount_type: {
        type: Sequelize.ENUM("PERCENTAGE", "FIXED"),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      usage_limit_per_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      used_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "EXPIRED"),
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

    await queryInterface.createTable("coupon_usages", {
      coupon_usage_id: {
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
      coupon_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      coupon_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

    await queryInterface.createTable("order_tracking_events", {
      tracking_event_id: {
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
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      event_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      is_customer_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.createTable("notifications", {
      notification_id: {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "IN_APP"),
        allowNull: false,
      },
      recipient: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      template_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SENT", "FAILED", "SKIPPED"),
        defaultValue: "PENDING",
      },
      provider_response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.createTable("invoices", {
      invoice_id: {
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
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      invoice_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      currency_code: {
        type: Sequelize.STRING,
        defaultValue: "INR",
      },
      invoice_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sub_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      grand_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      billing_snapshot: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      shipping_snapshot: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      line_items_snapshot: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("GENERATED", "VOID"),
        defaultValue: "GENERATED",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invoices");
    await queryInterface.dropTable("notifications");
    await queryInterface.dropTable("order_tracking_events");
    await queryInterface.dropTable("coupon_usages");
    await queryInterface.dropTable("coupons");
    await queryInterface.removeColumn("orders", "tracking_number");
    await queryInterface.removeColumn("orders", "coupon_code");
    await queryInterface.removeColumn("orders", "coupon_id");
    await queryInterface.removeColumn("carts", "applied_coupon_code");
    await queryInterface.removeColumn("carts", "applied_coupon_id");
  },
};
