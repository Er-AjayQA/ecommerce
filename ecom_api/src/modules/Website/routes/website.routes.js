const productController = require("../../Admin/Product/controllers/productController");
const categoryController = require("../../Admin/masters/Category/controllers/categoryController");
const menuController = require("../../Admin/Menus/controller/menus.controller");
const collectionsController = require("../../Admin/masters/Collections/controller/collection.controller");
const designController = require("../../Admin/TenantsThemes/controller/tenant_design.controller");
const couponController = require("../../Admin/Coupons/controllers/couponController");

module.exports = (app) => {
  app.get(
    "/api/v1/website/get_active_theme",
    designController.get_active_theme,
  );
  app.get(
    "/api/v1/website/get_active_layout",
    designController.get_active_layout,
  );
  app.get(
    "/api/v1/website/get_active_template",
    designController.get_active_template,
  );
  app.get(
    "/api/v1/website/getActiveStoreDesign",
    designController.getActiveStoreDesign,
  );

  app.get("/api/v1/website/get_All_Product", productController.get_All_Product);
  app.get(
    "/api/v1/website/get_ById_Product/:id",
    productController.get_ById_Product,
  );
  app.get(
    "/api/v1/website/get_All_Category",
    categoryController.get_All_Category,
  );
  app.get("/api/v1/website/get_All_Menus", menuController.get_All_Menus);
  app.get(
    "/api/v1/website/get_All_Collections",
    collectionsController.get_All_Collections,
  );
  app.get(
    "/api/v1/website/get_ById_Collections/:id",
    collectionsController.get_ById_Collections,
  );
  app.get(
    "/api/v1/website/get_Collection_Products/:id",
    collectionsController.get_Collection_Products,
  );
  app.post(
    "/api/v1/website/validate_Coupon",
    couponController.validate_Website_Coupon,
  );
};
