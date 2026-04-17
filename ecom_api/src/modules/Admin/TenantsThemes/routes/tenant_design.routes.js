const designController = require("../controller/tenant_design.controller");
const { verifyToken } = require("../../../../middleware/auth.middleware");

module.exports = (app) => {
  app.post("/api/v1/tenants/apply_theme", designController.apply_theme);
  app.get(
    "/api/v1/tenants/get_active_theme",
    designController.get_active_theme,
  );

  app.post("/api/v1/tenants/apply_layout", designController.apply_layout);
  app.get(
    "/api/v1/tenants/get_active_layout",
    designController.get_active_layout,
  );

  app.post("/api/v1/tenants/apply_template", designController.apply_template);
  app.get(
    "/api/v1/tenants/get_active_template",
    designController.get_active_template,
  );

  app.get(
    "/api/v1/tenants/getActiveStoreDesign",
    designController.getActiveStoreDesign,
  );
  app.post(
    "/api/v1/tenants/resetStoreDesign",
    designController.resetStoreDesign,
  );
};
