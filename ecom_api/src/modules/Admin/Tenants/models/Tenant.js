const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Tenant.init(
    {
      tenant_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organizationName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subDomain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dataBaseName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      packageid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trial_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_help_email_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_reminder_email_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("SUCCESS", "PENDING", "FAILED"),
        defaultValue: "PENDING",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "tenants",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Tenant;
};