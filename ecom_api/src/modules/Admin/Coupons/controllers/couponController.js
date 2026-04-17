const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const { validateCoupon } = require("../../../../services/cartPricing.service");

const CouponModels = db.CouponModels;
const CouponUsageModels = db.CouponUsageModels;
const CartModels = db.CartModels;

exports.create_Coupon = async (req, res) => {
  try {
    const payload = req.validatedBody;
    const coupon = await CouponModels.create({
      ...payload,
      code: payload.code.toUpperCase(),
    });

    return res.status(201).send({ success: true, code: 201, message: "Coupon created successfully", data: coupon });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_All_Coupons = async (req, res) => {
  try {
    const coupons = await CouponModels.findAll({
      where: { isDeleted: false },
      include: [{ model: CouponUsageModels, as: "usages", required: false }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Coupons fetched successfully", data: coupons });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Coupon = async (req, res) => {
  try {
    const coupon = await CouponModels.findByPk(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).send({ success: false, code: 404, message: "Coupon not found" });
    }

    await coupon.update(req.validatedBody);
    return res.status(200).send({ success: true, code: 200, message: "Coupon updated successfully", data: coupon });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.delete_Coupon = async (req, res) => {
  try {
    const coupon = await CouponModels.findByPk(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).send({ success: false, code: 404, message: "Coupon not found" });
    }

    await coupon.update({ isDeleted: true, isActive: false, status: "INACTIVE" });
    return res.status(200).send({ success: true, code: 200, message: "Coupon deleted successfully" });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.validate_Coupon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const cart = await CartModels.findOne({
      where: { user_id: userId, status: "ACTIVE" },
      transaction,
    });

    const subTotal = cart ? Number(cart.sub_total || 0) : 0;
    const result = await validateCoupon({
      couponCode: req.validatedBody.couponCode,
      userId,
      subTotal,
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Coupon is valid",
      data: {
        coupon: result.coupon,
        discountAmount: result.discountAmount,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).send({ success: false, code: 400, message: error.message });
  }
};

exports.validate_Website_Coupon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { couponCode, subTotal = 0 } = req.body;
    const result = await validateCoupon({
      couponCode,
      userId: null,
      subTotal,
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Coupon is valid",
      data: {
        coupon: result.coupon,
        discountAmount: result.discountAmount,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).send({
      success: false,
      code: 400,
      message: error.message || "Coupon is not valid",
    });
  }
};
