const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const publicRoutes = [
      "/api/v1/tenants/register_tenant_user",
      "/api/v1/tenants/verify_otp",
      "/api/v1/tenants/resend_otp",
      "/api/v1/tenants/check_registration",
      "/api/v1/tenants/forgot_password",
      "/api/v1/tenants/reset_password",
      "/api/v1/tenants/login_tenant_user",
      "/api/v1/tenants/send_customer_otp",
      "/api/v1/tenants/verify_customer_otp"
    ];

    const isPublicRoute = publicRoutes.some(route =>
      req.originalUrl.toLowerCase().startsWith(route.toLowerCase())
    );

    if (isPublicRoute) {
      return next();
    }

    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
      return res.status(401).send({ success: false, code: 401, message: "Token not provided" });
    }

    const token = bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : bearerHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Token has expired" : "Invalid or expired token";
    return res.status(401).send({ success: false, code: 401, message: message });
  }
};
