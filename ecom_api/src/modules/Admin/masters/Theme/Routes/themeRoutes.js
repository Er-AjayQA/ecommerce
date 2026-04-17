const ThemeController = require("../Controller/themeController");

module.exports = (app) => {
    app.post("/api/v1/create_Theme", ThemeController.create_Theme);
    app.get("/api/v1/get_All_Themes", ThemeController.get_All_Themes);
    app.get("/api/v1/get_ById_Theme/:id", ThemeController.get_ById_Theme);
    app.put("/api/v1/update_Theme/:id", ThemeController.update_Theme);
    app.delete("/api/v1/delete_Theme/:id", ThemeController.delete_Theme);
    app.patch("/api/v1/toggle_Theme_Status/:id", ThemeController.toggle_Theme_Status);
};