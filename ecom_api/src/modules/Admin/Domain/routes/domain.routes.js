const domainController = require("../controller/domain.controller");

module.exports = (app) => {
  app.get("/api/v1/domain/get_All_Domains", domainController.get_All_Domains);
  app.get("/api/v1/domain/get_Dns_Records/:tenant_domain_id", domainController.get_Dns_Records_By_Domain_Id);
  app.post(
    "/api/v1/domain/verify_Dns_Records/:tenant_domain_id",
    domainController.verify_Dns_Records,
  );
};
