require("dotenv").config({ quiet: true });
const app = require('./app');
const { mainSequelize } = require("./src/indexRoutes/index");
const templateDB = require('./src/config/templateDatabase');
const chalk = require('chalk');

const PORT = process.env.PORT || 5000;

Promise.all([mainSequelize.authenticate(), templateDB.authenticate()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(chalk.yellow.bold(`🚀 Server running on port ${PORT}`));
    });
  })
  .catch((error) => {
    console.error(chalk.red.bold("❌ DB Connection Failed"));
    console.error(chalk.red(error.message));
  });