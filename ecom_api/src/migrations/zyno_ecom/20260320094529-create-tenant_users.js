'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tenants_user', {
            tenant_user_id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            organizationName: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            domain: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            dataBaseName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            otp: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            otpExpiresAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            otpAttempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            otpVerifyStatus: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            package_details: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'PENDING',
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
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tenants_user');
    },
};