'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {

    }
  }
  Users.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      order_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      domain: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      email_id: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      mobile_number: {
        type: DataTypes.STRING
      },
      otp: {
        type: DataTypes.STRING
      },
      otp_expiry: {
        type: DataTypes.STRING
      },
      tenant_id: {
        type: DataTypes.UUID
      },
      tenant_user_id: {
        type: DataTypes.UUID
      },
      role_id: {
        type: DataTypes.UUID
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE"
      },
    },
    {
      sequelize,
      modelName: 'Users',
      tableName: 'users',
      freezeTableName: true,
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    });
  return Users;
};