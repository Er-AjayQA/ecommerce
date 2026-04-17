const MediaController = require("../controller/media.controller");

module.exports = (app) => {
  app.get("/api/v1/get_All_Media/:id", MediaController.get_All_Media);
};
