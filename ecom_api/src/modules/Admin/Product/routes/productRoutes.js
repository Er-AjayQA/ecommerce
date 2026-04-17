const productController = require("../controllers/productController");
const { uploadProductMedia, handleMulterError } = require("../../../../middleware/productMediaUpload");
// const validate = require("../../../middleware/validate");
// const { ProductDTO } = require("../../../dto/product.dto");

module.exports = (app) => {
  app.post("/api/v1/create_Product", uploadProductMedia.array("files", 10), handleMulterError, productController.create_Product);
  app.put("/api/v1/update_Product/:id", uploadProductMedia.array("files", 10), handleMulterError, productController.update_Product);
  app.put("/api/v1/update_Status_Product/:id", productController.update_Status_Product);
  app.get("/api/v1/get_All_Product", productController.get_All_Product);
  app.post("/api/v1/get_All_filtered_Product", productController.get_All_filtered_Product);
  app.get("/api/v1/get_ById_Product/:id", productController.get_ById_Product);
  app.delete("/api/v1/delete_Product/:id", productController.delete_Product);
};
