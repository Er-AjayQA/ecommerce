"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TenantDomainDnsRecord extends Model {
    static associate(models) {
      TenantDomainDnsRecord.belongsTo(models.TenantDomain, {
        foreignKey: "tenant_domain_id",
        as: "tenantDomain",
      });
    }
  }

  TenantDomainDnsRecord.init(
    {
      tenant_domain_dns_record_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      tenant_domain_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      record_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      zyno_values: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      customer_values: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "TenantDomainDnsRecord",
      tableName: "tenant_domain_dns_records",
      timestamps: true,
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      indexes: [
        {
          unique: true,
          fields: ["record_type", "name"],
          name: "tenant_domain_dns_records_record_type_name_unique",
        },
      ],
    }
  );

  return TenantDomainDnsRecord;
};
