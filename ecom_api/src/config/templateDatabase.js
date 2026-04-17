const { Sequelize } = require("sequelize");
require("dotenv").config();

const templateDB = new Sequelize(
  process.env.TEMPLATE_DB,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  }
);

module.exports = templateDB;