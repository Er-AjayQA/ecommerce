import api from "./api";

export const createCollections = (data) =>
  api.post("/api/v1/create_Collections", data);

export const updateCollections = (id, data) =>
  api.put(`/api/v1/update_Collections/${id}`, data);

export const updateCollectionStatus = (id, data) =>
  api.put(`/api/v1/update_Status_Collections/${id}`, data);

export const getAllCollectionsApi = (page, limit, search, statusBy) =>
  api.get("/api/v1/get_All_Collections", {
    params: {
      limit: limit,
      search: search,
      page: page,
      statusBy,
    },
  });

export const getByIdCollections = (id) =>
  api.get(`/api/v1/get_ById_Collections/${id}`);
