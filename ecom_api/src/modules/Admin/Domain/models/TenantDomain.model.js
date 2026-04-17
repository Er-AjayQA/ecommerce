"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TenantDomain extends Model {
    static associate(models) {
      TenantDomain.hasMany(models.TenantDomainDnsRecord, {
        foreignKey: "tenant_domain_id",
        as: "dnsRecords",
      });
    }
  }

  TenantDomain.init(
    {
      tenant_domain_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: "TenantDomain",
      tableName: "tenant_domain",
      timestamps: true,
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return TenantDomain;
};
