'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenant_domain_dns_records', {
      tenant_domain_dns_record_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        allowNull: false,
        primaryKey: true,
      },
      tenant_domain_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'tenant_domain',
          key: 'tenant_domain_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      record_type: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      zyno_values: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      customer_values: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'tenant_domain_dns_records',
      ['record_type', 'name'],
      { unique: true, name: 'tenant_domain_dns_records_record_type_name_unique' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tenant_domain_dns_records');
  },
};

