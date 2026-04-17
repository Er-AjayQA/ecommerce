const adminNotificationController = require("../controllers/adminNotificationController");
const validate = require("../../../../middleware/validate");
const { SendAdminNotificationDTO } = require("../../../../dto/adminNotification.dto");

module.exports = (app) => {
  app.get("/api/v1/admin/notifications", adminNotificationController.get_All_Admin_Notifications);
  app.post("/api/v1/admin/notifications", validate(SendAdminNotificationDTO), adminNotificationController.send_Admin_Notification);
};
