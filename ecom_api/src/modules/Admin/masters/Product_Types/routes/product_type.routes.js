const TypeController = require("../controller/product_type.controller");

module.exports = (app) => {
  app.post("/api/v1/create_product_types", TypeController.create_product_types);
  app.get("/api/v1/getAll_product_types", TypeController.getAll_product_types);
  app.get(
    "/api/v1/getById_product_types/:id",
    TypeController.getById_product_types,
  );
};
