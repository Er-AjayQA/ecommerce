const express = require("express");
const path = require("path");
const cors = require("cors");
const { tenantMid } = require("./src/middleware/tenantMiddleware");
const { verifyToken } = require("./src/middleware/auth.middleware.js");
const { handleDatabaseError } = require("./src/utils/errorHandler");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Audit",
      "x-tenant-domain",
    ],
    credentials: true,
  }),
);

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "200mb" }));

//////////////////// TENANT ROUTES ////////////////////

app.use(tenantMid);

//////////////////// WEBSITE PUBLIC ROUTES ////////////////////

require("./src/modules/Website/routes/website.routes.js")(app);

//////////////////// PROTECTED ROUTES ////////////////////

app.use(verifyToken);

//////////////////// ROUTES ////////////////////

require("./src/modules/Admin/Tenants/routes/tenant.routes")(app);
require("./src/modules/Admin/Product/routes/productRoutes")(app);
require("./src/modules/Admin/masters/Category/routes/categoryRoutes.js")(app);
require("./src/modules/Admin/masters/Vendors/routes/vendor.routes.js")(app);
require("./src/modules/Admin/masters/Collections/routes/collection.routes.js")(
  app,
);
require("./src/modules/Admin/masters/Tags/routes/tag.routes.js")(app);
require("./src/modules/Admin/masters/Product_Types/routes/product_type.routes.js")(
  app,
);
require("./src/modules/Admin/masters/Media/routes/media.routes.js")(app);
require("./src/modules/Admin/Menus/routes/menus.routes.js")(app);
require("./src/modules/Admin/Coupons/routes/coupon.routes.js")(app);
require("./src/modules/Admin/Reports/routes/reports.routes.js")(app);
require("./src/modules/Admin/Orders/routes/adminOrder.routes.js")(app);
require("./src/modules/Admin/Customers/routes/adminCustomer.routes.js")(app);
require("./src/modules/Admin/Notifications/routes/adminNotification.routes.js")(
  app,
);
require("./src/modules/Users/Cart/routes/cartRoutes.js")(app);
require("./src/modules/Admin/Domain/routes/domain.routes.js")(app);
require("./src/modules/Users/Wishlist/routes/wishlistRoutes.js")(app);
require("./src/modules/Users/Addresses/routes/addressRoutes.js")(app);
require("./src/modules/Users/Orders/routes/orderRoutes.js")(app);
require("./src/modules/Users/Notifications/routes/notificationRoutes.js")(app);
require("./src/modules/Users/Invoices/routes/invoiceRoutes.js")(app);
require("./src/modules/Admin/TenantsThemes/routes/tenant_design.routes.js")(
  app,
);

app.get("/", (req, res) => {
  return res.status(200).send({
    success: true,
    code: 200,
    message: "Welcome to Zyno Ecom Application.",
  });
});

//////////////////// 404 ALWAYS LAST ////////////////////

app.use((req, res) => {
  return res.status(404).send({
    success: false,
    code: 404,
    message: `Route ${req.originalUrl} not found`,
  });
});

//////////////////// ERROR HANDLER LAST ////////////////////

app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);
  const formattedError = handleDatabaseError(error);
  return res.status(formattedError.code || 500).send(formattedError);
});

module.exports = app;
