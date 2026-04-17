const { Op } = require("sequelize");
const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const { createNotification } = require("../../../../services/notification.service");

const NotificationModels = db.NotificationModels;
const UserModels = db.UserModels;
const OrderModels = db.OrderModels;

exports.get_All_Admin_Notifications = async (req, res) => {
  try {
    const { channel, status, search, userId, orderId } = req.query;
    const where = {};

    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (userId) where.user_id = userId;
    if (orderId) where.order_id = orderId;
    if (search) {
      where[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
        { recipient: { [Op.like]: `%${search}%` } },
      ];
    }

    const notifications = await NotificationModels.findAll({
      where,
      include: [
        { model: UserModels, as: "user", attributes: ["user_id", "name", "email_id", "mobile_number"], required: false },
        { model: OrderModels, as: "order", attributes: ["order_id", "code", "status", "grand_total"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Admin notifications fetched successfully", data: notifications });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.send_Admin_Notification = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const body = req.validatedBody || req.body;
    let recipient = body.recipient || null;

    const user = body.userId ? await UserModels.findByPk(body.userId, { transaction }) : null;
    const order = body.orderId ? await OrderModels.findByPk(body.orderId, { transaction }) : null;

    if (body.userId && !user) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "User not found" });
    }

    if (body.orderId && !order) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    if (!recipient && user) {
      if (body.channel === "EMAIL") recipient = user.email_id;
      if (body.channel === "SMS") recipient = user.mobile_number;
    }

    const notification = await createNotification({
      userId: body.userId || null,
      orderId: body.orderId || null,
      channel: body.channel,
      recipient,
      subject: body.subject,
      message: body.message,
      templateKey: body.templateKey,
      transaction,
    });

    await transaction.commit();
    return res.status(201).send({ success: true, code: 201, message: "Notification created successfully", data: notification });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
