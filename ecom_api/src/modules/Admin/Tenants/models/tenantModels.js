const fs = require("fs");
const path = require("path");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const db = {};

  fs.readdirSync(__dirname)
    .filter(file =>
      file !== "index.js" &&
      file !== "tenantModels.js" &&
      file.endsWith(".js")
    )
    .forEach(file => {
      const defineModel = require(path.join(__dirname, file));

      // ✅ DO NOT CALL CLASS DIRECTLY
      const model = defineModel(sequelize, DataTypes);
      db[model.name] = model;
    });

  // ✅ Associations
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  return db;
};