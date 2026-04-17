const { Op } = require("sequelize");
const { Tenant } = require("../indexRoutes/index");
const asyncLocalStorage = require("../utils/tenantContext");
const {
  normalizeDomain,
  getTenantConnection,
} = require("../utils/tenantHelpers");
const migrateTenant = require("../utils/migrateTenant");
const seedTenant = require("../utils/seedTenant");

const connections = {};

exports.tenantMid = async (req, res, next) => {
  try {
    const publicRoutes = [
      "/api/v1/tenants/register_Tenant_User",
      "/api/v1/tenants/verify_Otp",
      "/api/v1/tenants/resend_Otp",
      "/api/v1/tenants/check_Registration",
      "/api/v1/tenants/forgot_Password",
      "/api/v1/tenants/reset_Password",
      "/api/v1/tenants/login_Tenant_User",
      "/api/v1/tenants/send_Customer_Otp",
      "/api/v1/tenants/verify_Customer_Otp",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      req.originalUrl.toLowerCase().startsWith(route.toLowerCase()),
    );

    let incomingDomain =
      req.headers["x-tenant-domain"] || req.body?.domain || req.query?.domain;

    if (!incomingDomain) {
      if (isPublicRoute) return next();
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Tenant domain header missing",
      });
    }

    incomingDomain = String(incomingDomain).trim();
    const normalizedDomain = normalizeDomain(incomingDomain);

    const tenant = await Tenant.findOne({
      where: {
        isDeleted: 0,
        [Op.or]: [{ domain: incomingDomain }, { domain: normalizedDomain }],
      },
    });

    if (!tenant) {
      if (isPublicRoute) return next();
      return res
        .status(404)
        .send({ success: false, code: 404, message: "Tenant not found" });
    }

    if (!tenant.dataBaseName) {
      return res.status(500).send({
        success: false,
        code: 500,
        message: "Tenant database name not found",
      });
    }

    if (!connections[tenant.dataBaseName]) {
      const tenantDB = await getTenantConnection(tenant);
      await migrateTenant(tenantDB);
      await seedTenant(tenantDB);
      connections[tenant.dataBaseName] = tenantDB;
      console.log(
        "Connected, migrated and seeded tenant DB:",
        tenant.dataBaseName,
      );
    }

    const tenantDB = connections[tenant.dataBaseName];
    asyncLocalStorage.enterWith({ tenantDB, tenant });

    req.tenant = tenant;
    req.tenantDomain = normalizedDomain;

    return next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
    return res
      .status(500)
      .send({ success: false, code: 500, message: "Tenant connection failed" });
  }
};
