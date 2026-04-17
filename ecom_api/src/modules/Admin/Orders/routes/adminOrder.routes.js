const adminOrderController = require("../controllers/adminOrderController");
const validate = require("../../../../middleware/validate");
const { UpdateAdminOrderStatusDTO, UpdateAdminPaymentStatusDTO } = require("../../../../dto/adminOrder.dto");

module.exports = (app) => {
  app.get("/api/v1/admin/orders", adminOrderController.get_All_Admin_Orders);
  app.get("/api/v1/admin/orders/:id", adminOrderController.get_Admin_Order_By_Id);
  app.patch("/api/v1/admin/orders/:id/status", validate(UpdateAdminOrderStatusDTO), adminOrderController.update_Admin_Order_Status);
  app.patch("/api/v1/admin/orders/:id/payment-status", validate(UpdateAdminPaymentStatusDTO), adminOrderController.update_Admin_Payment_Status);
};
