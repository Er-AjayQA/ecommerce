import api from "./api";

export const getAllMediaApi = (id, type) =>
  api.get(`/api/v1/get_All_Media/${id}`, {
    params: {
      type: type,
    },
  });
