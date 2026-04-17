import API from "./api";

export const createVendorsApi = (data) =>
  API.post("api/v1/create_vendors", data);

export const getAllVendorsApi = () => API.get("api/v1/getAll_vendors");
