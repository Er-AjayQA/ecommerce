const reportsController = require("../controllers/reportsController");

module.exports = (app) => {
  app.get("/api/v1/admin/reports/dashboard", reportsController.get_Dashboard_Analytics);
  app.get("/api/v1/admin/reports/sales", reportsController.get_Sales_Report);
};
