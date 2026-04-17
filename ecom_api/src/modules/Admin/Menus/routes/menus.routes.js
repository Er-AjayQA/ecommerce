const MenuController = require("../controller/menus.controller");
const validate = require("../../../../middleware/validate");
const { MenuDTO } = require("../../../../dto/menu.dto");

module.exports = (app) => {
  app.post(
    "/api/v1/create_Menus",
    validate(MenuDTO),
    MenuController.create_Menus,
  );
  app.put(
    "/api/v1/update_Menus/:id",
    validate(MenuDTO),
    MenuController.update_Menus,
  );
  app.put(
    "/api/v1/update_Status_Menus/:id",
    MenuController.update_Status_Menus,
  );
  app.get("/api/v1/get_All_Menus", MenuController.get_All_Menus);
  app.get("/api/v1/get_ById_Menus/:id", MenuController.get_ById_Menus);
  app.delete("/api/v1/delete_Menu/:id", MenuController.delete_Menu);
};
