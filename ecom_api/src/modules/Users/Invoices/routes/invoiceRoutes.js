const invoiceController = require("../controllers/invoiceController");

module.exports = (app) => {
  app.get("/api/v1/get_Order_Invoice/:orderId", invoiceController.get_Order_Invoice);
};
