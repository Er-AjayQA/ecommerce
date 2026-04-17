const TagController = require("../controller/tag.controller");

module.exports = (app) => {
  app.post("/api/v1/create_tags", TagController.create_tags);
  app.get("/api/v1/getAll_tags", TagController.getAll_tags);
  app.get("/api/v1/getById_tags/:id", TagController.getById_tags);
};
