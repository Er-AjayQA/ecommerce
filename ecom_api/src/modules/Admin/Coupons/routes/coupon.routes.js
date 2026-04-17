const couponController = require("../controllers/couponController");
const validate = require("../../../../middleware/validate");
const { CouponCreateDTO, CouponUpdateDTO, ApplyCouponDTO } = require("../../../../dto/coupon.dto");

module.exports = (app) => {
  app.post("/api/v1/admin/coupons", validate(CouponCreateDTO), couponController.create_Coupon);
  app.get("/api/v1/admin/coupons", couponController.get_All_Coupons);
  app.put("/api/v1/admin/coupons/:id", validate(CouponUpdateDTO), couponController.update_Coupon);
  app.delete("/api/v1/admin/coupons/:id", couponController.delete_Coupon);
  app.post("/api/v1/coupons/validate", validate(ApplyCouponDTO), couponController.validate_Coupon);
};
