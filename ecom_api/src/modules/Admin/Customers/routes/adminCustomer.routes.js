const adminCustomerController = require("../controllers/adminCustomerController");
const validate = require("../../../../middleware/validate");
const { UpdateCustomerStatusDTO } = require("../../../../dto/adminCustomer.dto");

module.exports = (app) => {
  app.get("/api/v1/admin/customers", adminCustomerController.get_All_Admin_Customers);
  app.get("/api/v1/admin/customers/:id", adminCustomerController.get_Admin_Customer_By_Id);
  app.patch("/api/v1/admin/customers/:id/status", validate(UpdateCustomerStatusDTO), adminCustomerController.update_Admin_Customer_Status);
};
