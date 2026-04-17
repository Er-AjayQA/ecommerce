const CollectionController = require("../controller/collection.controller");
const { uploadCollectionMedia, handleMulterError } = require("../../../../../middleware/collectionMediaUpload");
const validate = require("../../../../../middleware/validate");
const { CollectionDTO } = require("../../../../../dto/collection.dto");

module.exports = (app) => {
  app.post("/api/v1/create_Collections", uploadCollectionMedia.array("files", 10), handleMulterError, validate(CollectionDTO), CollectionController.create_Collections);
  app.put("/api/v1/update_Collections/:id", uploadCollectionMedia.array("files", 10), handleMulterError, validate(CollectionDTO), CollectionController.update_Collections);
  app.put("/api/v1/update_Status_Collections/:id", CollectionController.update_Status_Collections);
  app.get("/api/v1/get_All_Collections", CollectionController.get_All_Collections);
  app.get("/api/v1/get_ById_Collections/:id", CollectionController.get_ById_Collections);
  app.delete("/api/v1/delete_Collection/:id", CollectionController.delete_Collection);
};