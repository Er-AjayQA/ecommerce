const tenantController = require('../controller/tenant.controller');
const { verifyToken } = require("../../../../middleware/auth.middleware");

module.exports = (app) => {
    app.post("/api/v1/tenants/register_Tenant_User", tenantController.register_Tenant_User);
    app.post("/api/v1/tenants/verify_Otp", tenantController.verify_Otp);
    app.post("/api/v1/tenants/resend_Otp", tenantController.resend_Otp);
    app.post("/api/v1/tenants/login_Tenant_User", tenantController.login_Tenant_User);
    app.post("/api/v1/tenants/send_Customer_Otp", tenantController.send_Customer_Otp);
    app.post("/api/v1/tenants/verify_Customer_Otp", tenantController.verify_Customer_Otp);
    app.get("/api/v1/tenants/check_Registration/:tenant_user_id", tenantController.check_Registration);
    app.post("/api/v1/tenants/forgot_Password", tenantController.forgot_Password);
    app.post("/api/v1/tenants/reset_Password", tenantController.reset_Password);
    app.post("/api/v1/tenants/add_Tenant_User", verifyToken, tenantController.add_Tenant_User);
    app.get("/api/v1/tenants/get_All_Tenant_Users", verifyToken, tenantController.get_All_Tenant_Users);
    app.get("/api/v1/tenants/get_ById_Tenant_User/:id", verifyToken, tenantController.get_ById_Tenant_User);
    app.put("/api/v1/tenants/update_Tenant_User/:id", verifyToken, tenantController.update_Tenant_User);
    app.delete("/api/v1/tenants/delete_Tenant_User/:id", verifyToken, tenantController.delete_Tenant_User);
    app.post("/api/v1/tenants/change_Password", verifyToken, tenantController.change_Password);
};
