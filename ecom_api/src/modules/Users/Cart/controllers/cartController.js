const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const { resolvePrice, recalculateCart, validateCoupon } = require("../../../../services/cartPricing.service");

const CartModels = db.CartModels;
const CartItemModels = db.CartItemModels;
const ProductModels = db.Product;
const ProductVariantModels = db.ProductVariant;
const InventoryModels = db.InventoryItem;

const getCartInclude = () => ([
  {
    model: CartItemModels,
    as: "cart_items",
    include: [
      { model: ProductModels, as: "product" },
      { model: ProductVariantModels, as: "variant" },
    ],
  },
]);

const getOrCreateActiveCart = async (userId, transaction = null) => {
  let cart = await CartModels.findOne({ where: { user_id: userId, status: "ACTIVE" }, transaction });
  if (!cart) {
    cart = await CartModels.create(
      {
        user_id: userId,
        status: "ACTIVE",
      },
      { transaction }
    );
  }
  return cart;
};

exports.add_To_Cart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const body = req.validatedBody || req.body;
    const { productId, productVariantId = null, quantity } = body;

    if (!productId) {
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: "productId is required" });
    }

    if (!quantity || Number(quantity) < 1) {
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: "quantity must be at least 1" });
    }

    const product = await ProductModels.findOne({ where: { product_id: productId, isActive: true }, transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Product not found" });
    }

    let variant = null;
    if (productVariantId) {
      variant = await ProductVariantModels.findOne({
        where: { product_variant_id: productVariantId, product_id: productId },
        transaction,
      });

      if (!variant) {
        await transaction.rollback();
        return res.status(404).send({ success: false, code: 404, message: "Variant not found" });
      }
    }

    const inventory = await InventoryModels.findOne({
      where: productVariantId ? { product_variant_id: productVariantId } : { product_id: productId, product_variant_id: null },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inventory) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Inventory not found" });
    }

    const cart = await getOrCreateActiveCart(userId, transaction);
    const existingItem = await CartItemModels.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: productId,
        product_variant_id: productVariantId || null,
      },
      transaction,
    });

    const existingQty = existingItem ? Number(existingItem.quantity) : 0;
    const newQty = existingQty + Number(quantity);
    if (Number(inventory.available_quantity) < newQty) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: `Only ${Number(inventory.available_quantity)} item(s) available in stock`,
      });
    }

    const price = resolvePrice(product, variant);
    if (existingItem) {
      await existingItem.update(
        {
          quantity: newQty,
          unit_price: price,
          final_price: price,
          line_total: price * newQty,
        },
        { transaction }
      );
    } else {
      await CartItemModels.create(
        {
          cart_id: cart.cart_id,
          product_id: productId,
          product_variant_id: productVariantId,
          quantity: Number(quantity),
          unit_price: price,
          final_price: price,
          line_total: price * Number(quantity),
          is_selected: true,
        },
        { transaction }
      );
    }

    await recalculateCart(cart.cart_id, userId, transaction);

    const updatedCart = await CartModels.findOne({
      where: { cart_id: cart.cart_id },
      include: getCartInclude(),
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Item added to cart successfully", data: updatedCart });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Cart_Item = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const cartItemId = req.params.id;
    const body = req.validatedBody || req.body;
    const { quantity } = body;

    if (!quantity || Number(quantity) < 1) {
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: "quantity must be at least 1" });
    }

    const cart = await CartModels.findOne({ where: { user_id: userId, status: "ACTIVE" }, transaction });
    if (!cart) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Active cart not found" });
    }

    const item = await CartItemModels.findOne({ where: { cart_item_id: cartItemId, cart_id: cart.cart_id }, transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Cart item not found" });
    }

    const product = await ProductModels.findByPk(item.product_id, { transaction });
    const variant = item.product_variant_id ? await ProductVariantModels.findByPk(item.product_variant_id, { transaction }) : null;
    const inventory = await InventoryModels.findOne({
      where: item.product_variant_id ? { product_variant_id: item.product_variant_id } : { product_id: item.product_id, product_variant_id: null },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inventory) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Inventory not found" });
    }

    if (Number(inventory.available_quantity) < Number(quantity)) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: `Only ${Number(inventory.available_quantity)} item(s) available in stock`,
      });
    }

    const price = resolvePrice(product, variant);
    await item.update(
      {
        quantity: Number(quantity),
        unit_price: price,
        final_price: price,
        line_total: price * Number(quantity),
      },
      { transaction }
    );

    await recalculateCart(cart.cart_id, userId, transaction);

    const updatedCart = await CartModels.findOne({
      where: { cart_id: cart.cart_id },
      include: getCartInclude(),
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Cart item updated successfully", data: updatedCart });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_ById_Cart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cart = await CartModels.findOne({
      where: { user_id: userId, status: "ACTIVE" },
      include: getCartInclude(),
      order: [[{ model: CartItemModels, as: "cart_items" }, "cart_item_id", "DESC"]],
    });

    if (!cart) {
      return res.status(200).send({ success: true, code: 200, message: "Cart is empty", data: null });
    }

    return res.status(200).send({ success: true, code: 200, message: "Cart fetched successfully", data: cart });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.remove_Cart_Item = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const cartItemId = req.params.id;
    const cart = await CartModels.findOne({ where: { user_id: userId, status: "ACTIVE" }, transaction });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Active cart not found" });
    }

    const item = await CartItemModels.findOne({ where: { cart_item_id: cartItemId, cart_id: cart.cart_id }, transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Cart item not found" });
    }

    await item.destroy({ transaction });
    await recalculateCart(cart.cart_id, userId, transaction);

    const updatedCart = await CartModels.findOne({
      where: { cart_id: cart.cart_id },
      include: getCartInclude(),
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Item removed from cart successfully", data: updatedCart });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.clear_Cart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const cart = await CartModels.findOne({ where: { user_id: userId, status: "ACTIVE" }, transaction });

    if (!cart) {
      await transaction.rollback();
      return res.status(200).send({ success: true, code: 200, message: "Cart already empty" });
    }

    await CartItemModels.destroy({ where: { cart_id: cart.cart_id }, transaction });
    await cart.update(
      {
        total_items: 0,
        sub_total: 0,
        discount_amount: 0,
        tax_amount: 0,
        shipping_amount: 0,
        grand_total: 0,
        applied_coupon_id: null,
        applied_coupon_code: null,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Cart cleared successfully" });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.apply_Coupon_To_Cart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const { couponCode } = req.validatedBody || req.body;
    const cart = await getOrCreateActiveCart(userId, transaction);
    const cartWithItems = await CartModels.findOne({
      where: { cart_id: cart.cart_id },
      include: getCartInclude(),
      transaction,
    });

    if (!cartWithItems.cart_items.length) {
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: "Add items to cart before applying coupon" });
    }

    const validation = await validateCoupon({
      couponCode,
      userId,
      subTotal: cartWithItems.sub_total,
      transaction,
    });

    await cart.update(
      {
        applied_coupon_id: validation.coupon.coupon_id,
        applied_coupon_code: validation.coupon.code,
      },
      { transaction }
    );

    const updatedCart = await recalculateCart(cart.cart_id, userId, transaction);
    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Coupon applied successfully", data: updatedCart });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).send({ success: false, code: 400, message: error.message || "Unable to apply coupon" });
  }
};

exports.remove_Coupon_From_Cart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const cart = await CartModels.findOne({ where: { user_id: userId, status: "ACTIVE" }, transaction });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Active cart not found" });
    }

    await cart.update(
      {
        applied_coupon_id: null,
        applied_coupon_code: null,
        discount_amount: 0,
      },
      { transaction }
    );

    const updatedCart = await recalculateCart(cart.cart_id, userId, transaction);
    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Coupon removed successfully", data: updatedCart });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
