const VendorController = require("../controller/vendor.controller");

module.exports = (app) => {
  app.post("/api/v1/create_vendors", VendorController.create_vendors);
  app.get("/api/v1/getAll_vendors", VendorController.getAll_vendors);
  app.get("/api/v1/getById_vendors/:id", VendorController.getById_vendors);
};
