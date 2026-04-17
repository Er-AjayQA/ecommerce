import api from "./api";

export const createMenuApi = (data) => api.post("/api/v1/create_Menus", data);

export const updateMenuApi = (id, data) =>
  api.put(`/api/v1/update_Menus/${id}`, data);

export const updateMenuStatus = (id, data) =>
  api.put(`/api/v1/update_Status_Menus/${id}`, data);

export const getAllMenusApi = (page, limit, search, statusBy) =>
  api.get("/api/v1/get_All_Menus", {
    params: {
      limit: limit,
      search: search,
      page: page,
      statusBy,
    },
  });

export const getMenuByIdApi = (id) => api.get(`/api/v1/get_ById_Menus/${id}`);
