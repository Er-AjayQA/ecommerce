'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tenants', {
            tenant_id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            organizationName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            domain: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            subDomain: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            dataBaseName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            userLimit: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            packageid: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            trial_end_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            is_help_email_sent: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            is_reminder_email_sent: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: Sequelize.ENUM("SUCCESS", "PENDING", "FAILED"),
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
        await queryInterface.dropTable('tenants');
    },
};