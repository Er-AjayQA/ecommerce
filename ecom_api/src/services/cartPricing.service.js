const db = require("../indexRoutes/index");

const CartModels = db.CartModels;
const CartItemModels = db.CartItemModels;
const CouponModels = db.CouponModels;
const CouponUsageModels = db.CouponUsageModels;

const toAmount = (value) => Number(value || 0);

const resolvePrice = (product, variant) => {
  if (variant) {
    if (variant.sale_price && Number(variant.sale_price) > 0) {
      return Number(variant.sale_price);
    }
    return Number(variant.price);
  }

  if (product.sale_price && Number(product.sale_price) > 0) {
    return Number(product.sale_price);
  }

  return Number(product.base_price);
};

const calculateCouponDiscount = (coupon, subTotal) => {
  if (!coupon) return 0;

  const amount = toAmount(subTotal);
  let discount = coupon.discount_type === "PERCENTAGE"
    ? (amount * toAmount(coupon.discount_value)) / 100
    : toAmount(coupon.discount_value);

  if (coupon.max_discount_amount) {
    discount = Math.min(discount, toAmount(coupon.max_discount_amount));
  }

  discount = Math.min(discount, amount);
  return Number(discount.toFixed(2));
};

const validateCoupon = async ({ couponCode, userId, subTotal, transaction }) => {
  if (!couponCode) {
    return { coupon: null, discountAmount: 0 };
  }

  const normalizedCode = String(couponCode).trim().toUpperCase();
  const coupon = await CouponModels.findOne({
    where: {
      code: normalizedCode,
      isDeleted: false,
      isActive: true,
    },
    transaction,
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (coupon.status !== "ACTIVE") {
    throw new Error("Coupon is not active");
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw new Error("Coupon is not yet active");
  }

  if (coupon.ends_at && new Date(coupon.ends_at) < now) {
    throw new Error("Coupon has expired");
  }

  if (coupon.usage_limit && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
    throw new Error("Coupon usage limit reached");
  }

  if (toAmount(subTotal) < toAmount(coupon.min_order_amount)) {
    throw new Error(`Minimum order amount should be ${coupon.min_order_amount}`);
  }

  if (coupon.usage_limit_per_user) {
    const usedByUser = await CouponUsageModels.count({
      where: {
        coupon_id: coupon.coupon_id,
        user_id: userId,
      },
      transaction,
    });

    if (usedByUser >= Number(coupon.usage_limit_per_user)) {
      throw new Error("You have already used this coupon the maximum allowed times");
    }
  }

  return {
    coupon,
    discountAmount: calculateCouponDiscount(coupon, subTotal),
  };
};

const recalculateCart = async (cartId, userId, transaction = null) => {
  const cart = await CartModels.findOne({
    where: { cart_id: cartId, user_id: userId },
    include: [
      {
        model: CartItemModels,
        as: "cart_items",
      },
    ],
    transaction,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const totalItems = cart.cart_items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subTotal = cart.cart_items.reduce((sum, item) => sum + toAmount(item.line_total), 0);

  let coupon = null;
  let discountAmount = 0;

  if (cart.applied_coupon_code) {
    try {
      const validation = await validateCoupon({
        couponCode: cart.applied_coupon_code,
        userId,
        subTotal,
        transaction,
      });
      coupon = validation.coupon;
      discountAmount = validation.discountAmount;
    } catch (error) {
      await cart.update(
        {
          applied_coupon_id: null,
          applied_coupon_code: null,
        },
        { transaction }
      );
    }
  }

  const taxAmount = 0;
  const shippingAmount = 0;
  const grandTotal = Math.max(0, subTotal - discountAmount + taxAmount + shippingAmount);

  await cart.update(
    {
      total_items: totalItems,
      sub_total: Number(subTotal.toFixed(2)),
      discount_amount: Number(discountAmount.toFixed(2)),
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      grand_total: Number(grandTotal.toFixed(2)),
      applied_coupon_id: coupon ? coupon.coupon_id : null,
      applied_coupon_code: coupon ? coupon.code : null,
    },
    { transaction }
  );

  return cart.reload({
    include: [{ model: CartItemModels, as: "cart_items" }],
    transaction,
  });
};

module.exports = {
  resolvePrice,
  recalculateCart,
  validateCoupon,
  calculateCouponDiscount,
};
