const { Op } = require("sequelize");
const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const { assertValidStatusTransition, createTrackingEvent } = require("../../../../services/orderLifecycle.service");
const { sendOrderNotifications } = require("../../../../services/notification.service");

const OrderModels = db.OrderModels;
const OrderItemModels = db.OrderItemModels;
const OrderTrackingEventModels = db.OrderTrackingEventModels;
const AddressModels = db.AddressModels;
const ProductModels = db.Product;
const ProductVariantModels = db.ProductVariant;
const UserModels = db.UserModels;
const CouponModels = db.CouponModels;
const InvoiceModels = db.InvoiceModels;

const getAdminOrderInclude = () => ([
  { model: UserModels, as: "user", attributes: ["user_id", "name", "email_id", "mobile_number", "status", "isActive"] },
  { model: AddressModels, as: "shipping_address" },
  { model: AddressModels, as: "billing_address" },
  { model: CouponModels, as: "coupon" },
  { model: InvoiceModels, as: "invoice" },
  {
    model: OrderTrackingEventModels,
    as: "tracking_events",
    required: false,
  },
  {
    model: OrderItemModels,
    as: "order_items",
    include: [
      { model: ProductModels, as: "product" },
      { model: ProductVariantModels, as: "variant" },
    ],
  },
]);

exports.get_All_Admin_Orders = async (req, res) => {
  try {
    const { status, payment_status, userId, search, startDate, endDate } = req.query;
    const where = { isDeleted: false };

    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (userId) where.user_id = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { coupon_code: { [Op.like]: `%${search}%` } },
        { tracking_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const orders = await OrderModels.findAll({
      where,
      include: getAdminOrderInclude(),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Admin orders fetched successfully", data: orders });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_Admin_Order_By_Id = async (req, res) => {
  try {
    const order = await OrderModels.findOne({
      where: { order_id: req.params.id, isDeleted: false },
      include: getAdminOrderInclude(),
      order: [[{ model: OrderTrackingEventModels, as: "tracking_events" }, "event_time", "DESC"]],
    });

    if (!order) {
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    return res.status(200).send({ success: true, code: 200, message: "Admin order fetched successfully", data: order });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Admin_Order_Status = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await OrderModels.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    const body = req.validatedBody || req.body;
    assertValidStatusTransition(order.status, body.status);

    await order.update(
      {
        status: body.status,
        tracking_number: body.trackingNumber || order.tracking_number,
      },
      { transaction }
    );

    await createTrackingEvent({
      orderId: order.order_id,
      status: body.status,
      title: body.title || `Order ${body.status.toLowerCase()}`,
      description: body.description || `Admin updated order status to ${body.status}`,
      location: body.location,
      createdBy: req.user.user_id,
      transaction,
    });

    const user = await UserModels.findByPk(order.user_id, { transaction });
    await sendOrderNotifications({ order, user, transaction });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Admin order status updated successfully", data: order });
  } catch (error) {
    await transaction.rollback();
    if (error.message?.startsWith("Invalid status transition")) {
      return res.status(400).send({ success: false, code: 400, message: error.message });
    }
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Admin_Payment_Status = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await OrderModels.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    const body = req.validatedBody || req.body;
    await order.update({ payment_status: body.payment_status }, { transaction });

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Payment status updated successfully", data: order });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
