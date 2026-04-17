const notificationController = require("../controllers/notificationController");

module.exports = (app) => {
  app.get("/api/v1/notifications", notificationController.get_User_Notifications);
};
