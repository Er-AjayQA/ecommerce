const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path");
const { Sequelize } = require("sequelize");

async function seedTenant(sequelizeInstance) {
  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, "../seeders/zyno_ecom_template/*.js").replace(/\\/g, "/"),
      resolve: ({ name, path: migrationPath, context }) => {
        const seeder = require(migrationPath);
        return {
          name,
          up: async () => seeder.up(context.getQueryInterface(), Sequelize),
          down: async () => seeder.down(context.getQueryInterface(), Sequelize),
        };
      },
    },
    context: sequelizeInstance,
    storage: new SequelizeStorage({
      sequelize: sequelizeInstance,
      modelName: "SequelizeData",
      tableName: "SequelizeData",
    }),
    logger: console,
  });

  try {
    console.log(`Checking for pending seeders for database: ${sequelizeInstance.config.database}`);
    const pending = await umzug.pending();
    if (pending.length > 0) {
      console.log(`Found ${pending.length} pending seeders. Applying...`);
      await umzug.up();
      console.log(`Seeders applied successfully for: ${sequelizeInstance.config.database}`);
    } else {
      console.log(`No pending seeders for: ${sequelizeInstance.config.database}`);
    }
  } catch (error) {
    console.error(`Seeder failed for database: ${sequelizeInstance.config.database}`);
    console.error(error);
  }
}

module.exports = seedTenant;
