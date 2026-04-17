const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TenantStoreDesign extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  TenantStoreDesign.init(
    {
      tenant_store_design_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      theme_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      layout_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      template_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      theme_config: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      layout_config: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      template_config: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
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
      tableName: "tenant_store_design",
      modelName: "TenantStoreDesignModel",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  return TenantStoreDesign;
};
