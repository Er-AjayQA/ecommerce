'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectionConditions extends Model {
    static associate(models) {
      CollectionConditions.belongsTo(models.Collection, {
        foreignKey: "collection_id",
        as: "collection",
      });
    }
  }
  CollectionConditions.init(
    {
      collection_condition_id: {
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
      title: {
        type: DataTypes.STRING
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      algorithm: {
        type: DataTypes.STRING
      },
      values: {
        type: DataTypes.JSON
      },
      collection_id: {
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
      modelName: 'CollectionConditions',
      tableName: "collection_conditions",
      freezeTableName: true,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return CollectionConditions;
};