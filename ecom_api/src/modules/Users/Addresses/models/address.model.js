"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Address extends Model {
        static associate(models) {
            Address.belongsTo(models.UserModels, {
                foreignKey: "user_id",
                as: "user",
            });
        }
    }

    Address.init(
        {
            address_id: {
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
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            first_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            last_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone_number: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address_line_1: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            address_line_2: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            postal_code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM("SHIPPING", "BILLING"),
                defaultValue: "SHIPPING",
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
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
                defaultValue: "ACTIVE",
            },
        },
        {
            sequelize,
            modelName: "AddressModels",
            tableName: "addresses",
            freezeTableName: true,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Address;
};
