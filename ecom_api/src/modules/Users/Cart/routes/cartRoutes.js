const cartController = require("../controllers/cartController");
const validate = require("../../../../middleware/validate");
const { CartDTO } = require("../../../../dto/cart.dto");
const { ApplyCouponDTO } = require("../../../../dto/coupon.dto");

module.exports = (app) => {
    app.post("/api/v1/add_To_Cart", validate(CartDTO), cartController.add_To_Cart);
    app.put("/api/v1/update_Cart_Item/:id", validate(CartDTO), cartController.update_Cart_Item);
    app.get("/api/v1/get_ById_Cart", cartController.get_ById_Cart);
    app.delete("/api/v1/remove_Cart_Item/:id", cartController.remove_Cart_Item);
    app.get("/api/v1/clear_Cart", cartController.clear_Cart);
    app.delete("/api/v1/clear_Cart", cartController.clear_Cart);
    app.post("/api/v1/cart/apply-coupon", validate(ApplyCouponDTO), cartController.apply_Coupon_To_Cart);
    app.delete("/api/v1/cart/remove-coupon", cartController.remove_Coupon_From_Cart);
};
