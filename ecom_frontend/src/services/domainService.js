import api from "./api";

export const getAllDomains = () => api.get("/api/v1/domain/get_All_Domains");

export const getDnsRecords = (tenantDomainId) =>
  api.get(`/api/v1/domain/get_Dns_Records/${tenantDomainId}`);

export const verifyDnsRecords = (tenantDomainId) =>
  api.post(`/api/v1/domain/verify_Dns_Records/${tenantDomainId}`);
