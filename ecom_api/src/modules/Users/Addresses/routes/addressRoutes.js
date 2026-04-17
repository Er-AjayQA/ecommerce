const addressController = require("../controllers/addressController");
const validate = require("../../../../middleware/validate");
const { AddressDTO } = require("../../../../dto/address.dto");

module.exports = (app) => {
    app.post("/api/v1/add_Address", validate(AddressDTO), addressController.add_Address);
    app.get("/api/v1/get_All_Addresses", addressController.get_All_Addresses);
    app.delete("/api/v1/delete_Address/:id", addressController.delete_Address);
};