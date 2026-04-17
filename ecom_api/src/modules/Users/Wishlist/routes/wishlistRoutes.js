const wishlistController = require("../controllers/wishlistController");
const validate = require("../../../../middleware/validate");
const { WishlistDTO } = require("../../../../dto/wishlist.dto");

module.exports = (app) => {
    app.post("/api/v1/add_To_Wishlist", validate(WishlistDTO), wishlistController.add_To_Wishlist);
    app.delete("/api/v1/remove_From_Wishlist/:id", wishlistController.remove_From_Wishlist);
    app.get("/api/v1/get_Wishlist", wishlistController.get_Wishlist);
    app.delete("/api/v1/clear_Wishlist", wishlistController.clear_Wishlist);
};
