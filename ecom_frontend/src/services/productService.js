import api from "./api";

export const getProductsApi = () => api.get("/products");
export const getAllProducts = (page, limit, search, statusBy) =>
  api.get("/api/v1/get_All_Product", {
    params: {
      limit: limit,
      search: search,
      page: page,
      statusBy,
    },
  });
export const getAllFilteredProducts = (search, data) =>
  api.post("/api/v1/get_All_filtered_Product", data, {
    params: {
      search: search,
    },
  });
export const getByIdProduct = (id) => api.get(`/api/v1/get_ById_Product/${id}`);
export const createProduct = (formData) =>
  api.post("/api/v1/create_Product", formData);
export const updateProduct = (id, formData) =>
  api.put(`/api/v1/update_Product/${id}`, formData);
export const updateProductStatus = (id, data) =>
  api.put(`/api/v1/update_Status_Product/${id}`, data);

// Categories
export const getAllCategory = () => api.get("/api/v1/get_All_Category");

// Tags
export const createProductTags = (data) =>
  api.post("/api/v1/create_tags", data);
export const getAllProductTags = () => api.get("/api/v1/getAll_tags");

// Types
export const createProductTypes = (data) =>
  api.post("/api/v1/create_product_types", data);
export const getAllProductTypesApi = () =>
  api.get("api/v1/getAll_product_types");
