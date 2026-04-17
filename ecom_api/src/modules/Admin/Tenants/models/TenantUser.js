const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TenantUser extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  TenantUser.init(
    {
      tenant_user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      organizationName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dataBaseName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otpAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      otpVerifyStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      package_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "tenants_user",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return TenantUser;
};