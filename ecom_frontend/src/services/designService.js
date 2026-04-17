import api from "./api";

export const applyThemeApi = (data) =>
  api.post("/api/v1/tenants/apply_theme", data);

export const getActiveThemeApi = () =>
  api.get(`/api/v1/tenants/get_active_theme`);

export const applyLayoutApi = (data) =>
  api.post("/api/v1/tenants/apply_layout", data);

export const getActiveLayoutApi = () =>
  api.get(`/api/v1/tenants/get_active_layout`);

export const applyTemplateApi = (data) =>
  api.post("/api/v1/tenants/apply_template", data);

export const getActiveTemplateApi = () =>
  api.get(`/api/v1/tenants/get_active_template`);

export const resetDesignApi = () =>
  api.post(`/api/v1/tenants/resetStoreDesign`);
