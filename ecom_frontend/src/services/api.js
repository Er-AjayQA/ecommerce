import axios from "axios";

const apiGateway = axios.create({
  baseURL: "http://localhost:5000",
  // baseURL: "http://192.168.20.53:5000",
  timeout: 10000,
  // headers: { "Content-Type": "application/json" },
});

apiGateway.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const host = window.location.origin;
  let tenantDomain = host;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["x-tenant-domain"] = tenantDomain;
  return config;
});

export default apiGateway;
