import api from "./api";


export const loginApi = (data) => api.post("api/v1/tenants/login_Tenant_User", data);
export const meApi = () => api.get("/auth/me");
export const forgotPasswordApi = (data) => api.post("/api/v1/tenants/forgot-password", data);
