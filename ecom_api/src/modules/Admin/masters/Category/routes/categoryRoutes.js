const categoryController = require('../controllers/categoryController');

module.exports = (app) => {
    app.post("/api/v1/create_Category", categoryController.create_Category);
    app.put("/api/v1/update_Category/:id", categoryController.update_Category);
    app.put("/api/v1/update_Status_Category/:id", categoryController.update_Status_Category);
    app.get("/api/v1/get_All_Category", categoryController.get_All_Category);
    app.get("/api/v1/get_ById_Category", categoryController.get_ById_Category);
};