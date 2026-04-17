const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path");
const { Sequelize } = require("sequelize");

async function migrateTenant(sequelizeInstance) {
    const umzug = new Umzug({
        migrations: {
            glob: path.join(__dirname, "../migrations/zyno_ecom_template/*.js").replace(/\\/g, '/'),
            resolve: ({ name, path: migrationPath, context }) => {
                const migration = require(migrationPath);
                return {
                    name,
                    up: async () => migration.up(context.getQueryInterface(), Sequelize),
                    down: async () => migration.down(context.getQueryInterface(), Sequelize),
                };
            },
        },
        context: sequelizeInstance,
        storage: new SequelizeStorage({ sequelize: sequelizeInstance }),
        logger: console,
    });

    try {
        console.log(`🚀 Checking for pending migrations for database: ${sequelizeInstance.config.database}`);
        const pending = await umzug.pending();
        if (pending.length > 0) {
            console.log(`📝 Found ${pending.length} pending migrations. Applying...`);
            await umzug.up();
            console.log(`✅ Migrations applied successfully for: ${sequelizeInstance.config.database}`);
        } else {
            console.log(`✨ No pending migrations for: ${sequelizeInstance.config.database}`);
        }
    } catch (error) {
        console.error(`❌ Migration failed for database: ${sequelizeInstance.config.database}`);
        console.error(error);
    }
}

module.exports = migrateTenant;
