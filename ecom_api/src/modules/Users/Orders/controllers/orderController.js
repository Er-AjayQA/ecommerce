const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const generateCode = require("../../../../utils/generateCode");
const { recalculateCart, validateCoupon } = require("../../../../services/cartPricing.service");
const { assertValidStatusTransition, createTrackingEvent } = require("../../../../services/orderLifecycle.service");
const { sendOrderNotifications } = require("../../../../services/notification.service");
const { createInvoiceForOrder } = require("../../../../services/invoice.service");

const OrderModels = db.OrderModels;
const OrderItemModels = db.OrderItemModels;
const CartModels = db.CartModels;
const CartItemModels = db.CartItemModels;
const InventoryModels = db.InventoryItem;
const AddressModels = db.AddressModels;
const ProductModels = db.Product;
const ProductVariantModels = db.ProductVariant;
const UserModels = db.UserModels;
const CouponModels = db.CouponModels;
const CouponUsageModels = db.CouponUsageModels;
const OrderTrackingEventModels = db.OrderTrackingEventModels;
const InvoiceModels = db.InvoiceModels;

const getOrderInclude = () => ([
  {
    model: AddressModels,
    as: "shipping_address"
  },
  {
    model: AddressModels,
    as: "billing_address"
  },
  {
    model: CouponModels,
    as: "coupon"
  },
  {
    model: InvoiceModels,
    as: "invoice"
  },
  {
    model: OrderTrackingEventModels,
    as: "tracking_events",
    required: false,
  },
  {
    model: OrderItemModels,
    as: "order_items",
    include: [
      {
        model: ProductModels,
        as: "product"
      },
      {
        model: ProductVariantModels,
        as: "variant"
      },
    ],
  },
]);

exports.place_Order = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const body = req.validatedBody || req.body;
    const { shippingAddressId, billingAddressId, couponCode } = body;
    const finalBillingAddressId = billingAddressId || shippingAddressId;

    const [shippingAddress, billingAddress] = await Promise.all([
      AddressModels.findOne({ where: { address_id: shippingAddressId, user_id: userId, isDeleted: false }, transaction }),
      AddressModels.findOne({ where: { address_id: finalBillingAddressId, user_id: userId, isDeleted: false }, transaction }),
    ]);

    if (!shippingAddress) {
      await transaction.rollback();
      return res.status(404).send({ success: false, message: "Shipping address not found" });
    }

    if (!billingAddress) {
      await transaction.rollback();
      return res.status(404).send({ success: false, message: "Billing address not found" });
    }

    let cart = await CartModels.findOne({
      where: { user_id: userId, status: "ACTIVE" },
      include: [
        {
          model: CartItemModels,
          as: "cart_items",
          include: [
            { model: ProductModels, as: "product" },
            { model: ProductVariantModels, as: "variant" },
          ],
        },
      ],
      transaction,
    });

    if (!cart || cart.cart_items.length === 0) {
      await transaction.rollback();
      return res.status(400).send({ success: false, message: "Cart is empty" });
    }

    for (const item of cart.cart_items) {
      const inventory = await InventoryModels.findOne({
        where: item.product_variant_id ? { product_variant_id: item.product_variant_id } : { product_id: item.product_id, product_variant_id: null },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory || Number(inventory.available_quantity) < Number(item.quantity)) {
        await transaction.rollback();
        return res.status(400).send({ success: false, message: "Insufficient inventory" });
      }
    }

    if (couponCode && !cart.applied_coupon_code) {
      const couponValidation = await validateCoupon({
        couponCode,
        userId,
        subTotal: cart.sub_total,
        transaction,
      });

      await cart.update(
        {
          applied_coupon_id: couponValidation.coupon.coupon_id,
          applied_coupon_code: couponValidation.coupon.code,
        },
        { transaction }
      );
    }

    cart = await recalculateCart(cart.cart_id, userId, transaction);
    cart = await CartModels.findOne({
      where: { cart_id: cart.cart_id },
      include: [
        {
          model: CartItemModels,
          as: "cart_items",
          include: [
            { model: ProductModels, as: "product" },
            { model: ProductVariantModels, as: "variant" },
          ],
        },
      ],
      transaction,
    });

    const orderCode = await generateCode(OrderModels, `order-${Date.now()}`);
    const newOrder = await OrderModels.create(
      {
        user_id: userId,
        cart_id: cart.cart_id,
        shipping_address_id: shippingAddressId,
        billing_address_id: finalBillingAddressId,
        sub_total: cart.sub_total,
        tax_amount: cart.tax_amount,
        shipping_amount: cart.shipping_amount,
        discount_amount: cart.discount_amount,
        grand_total: cart.grand_total,
        code: orderCode,
        coupon_id: cart.applied_coupon_id,
        coupon_code: cart.applied_coupon_code,
      },
      { transaction }
    );

    const createdOrderItems = [];
    for (const item of cart.cart_items) {
      const orderItemCode = await generateCode(OrderItemModels, `order-item-${Date.now()}-${item.product_id}`);
      const orderItem = await OrderItemModels.create(
        {
          order_id: newOrder.order_id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          unit_price: item.final_price,
          line_total: item.line_total,
          code: orderItemCode,
        },
        { transaction }
      );
      createdOrderItems.push(orderItem);

      const inventory = await InventoryModels.findOne({
        where: item.product_variant_id ? { product_variant_id: item.product_variant_id } : { product_id: item.product_id, product_variant_id: null },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      await inventory.update(
        {
          available_quantity: Number(inventory.available_quantity) - Number(item.quantity),
        },
        { transaction }
      );
    }

    if (cart.applied_coupon_id && Number(cart.discount_amount) > 0) {
      await CouponUsageModels.create(
        {
          coupon_id: cart.applied_coupon_id,
          order_id: newOrder.order_id,
          user_id: userId,
          coupon_code: cart.applied_coupon_code,
          discount_amount: cart.discount_amount,
        },
        { transaction }
      );

      await CouponModels.increment("used_count", {
        by: 1,
        where: { coupon_id: cart.applied_coupon_id },
        transaction,
      });
    }

    await createTrackingEvent({
      orderId: newOrder.order_id,
      status: "PENDING",
      title: "Order placed",
      description: "Your order has been placed successfully.",
      createdBy: userId,
      transaction,
    });

    await createInvoiceForOrder({
      order: newOrder,
      orderItems: createdOrderItems,
      billingAddress,
      shippingAddress,
      transaction,
    });

    await CartItemModels.destroy({ where: { cart_id: cart.cart_id }, transaction });
    await cart.update(
      {
        total_items: 0,
        sub_total: 0,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        grand_total: 0,
        applied_coupon_id: null,
        applied_coupon_code: null,
      },
      { transaction }
    );

    const user = await UserModels.findByPk(userId, { transaction });
    await sendOrderNotifications({ order: newOrder, user, transaction });

    const placedOrder = await OrderModels.findOne({
      where: { order_id: newOrder.order_id },
      include: getOrderInclude(),
      order: [[{ model: OrderTrackingEventModels, as: "tracking_events" }, "event_time", "DESC"]],
      transaction,
    });

    await transaction.commit();
    return res.status(200).send({ success: true, message: "Order placed successfully", data: placedOrder });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_All_User_Orders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orders = await OrderModels.findAll({
      where: { user_id: userId },
      include: getOrderInclude(),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Orders fetched successfully", data: orders });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_Order_By_Id = async (req, res) => {
  try {
    const order = await OrderModels.findOne({
      where: { order_id: req.params.id, user_id: req.user.user_id },
      include: getOrderInclude(),
      order: [[{ model: OrderTrackingEventModels, as: "tracking_events" }, "event_time", "DESC"]],
    });

    if (!order) {
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    return res.status(200).send({ success: true, code: 200, message: "Order fetched successfully", data: order });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Order_Status = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const orderId = req.params.id;
    const body = req.validatedBody || req.body;
    const { status, title, description, location, trackingNumber } = body;

    const order = await OrderModels.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    assertValidStatusTransition(order.status, status);

    await order.update(
      {
        status,
        tracking_number: trackingNumber || order.tracking_number,
      },
      { transaction }
    );

    await createTrackingEvent({
      orderId,
      status,
      title: title || `Order ${status.toLowerCase()}`,
      description: description || `Order status updated to ${status}`,
      location,
      createdBy: req.user.user_id,
      transaction,
    });

    const user = await UserModels.findByPk(order.user_id, { transaction });
    await sendOrderNotifications({ order, user, transaction });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Status updated successfully", data: order });
  } catch (error) {
    await transaction.rollback();
    if (error.message?.startsWith("Invalid status transition")) {
      return res.status(400).send({ success: false, code: 400, message: error.message });
    }
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_Order_Tracking = async (req, res) => {
  try {
    const order = await OrderModels.findOne({
      where: { order_id: req.params.id, user_id: req.user.user_id },
      include: [
        {
          model: OrderTrackingEventModels,
          as: "tracking_events",
          required: false,
        },
      ],
      order: [[{ model: OrderTrackingEventModels, as: "tracking_events" }, "event_time", "DESC"]],
    });

    if (!order) {
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Order tracking fetched successfully",
      data: {
        order_id: order.order_id,
        code: order.code,
        status: order.status,
        tracking_number: order.tracking_number,
        events: order.tracking_events,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.create_Order_Tracking_Event = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await OrderModels.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    const body = req.validatedBody || req.body;
    const event = await createTrackingEvent({
      orderId: order.order_id,
      status: body.status,
      title: body.title,
      description: body.description,
      location: body.location,
      eventTime: body.eventTime,
      createdBy: req.user.user_id,
      transaction,
    });

    if (order.status !== body.status) {
      assertValidStatusTransition(order.status, body.status);
      await order.update({ status: body.status }, { transaction });
    }

    await transaction.commit();
    return res.status(201).send({ success: true, code: 201, message: "Tracking event created successfully", data: event });
  } catch (error) {
    await transaction.rollback();
    if (error.message?.startsWith("Invalid status transition")) {
      return res.status(400).send({ success: false, code: 400, message: error.message });
    }
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
