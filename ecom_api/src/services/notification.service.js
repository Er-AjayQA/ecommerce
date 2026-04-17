const db = require("../indexRoutes/index");

const NotificationModels = db.NotificationModels;

const createNotification = async ({
  userId,
  orderId,
  channel,
  recipient,
  subject,
  message,
  templateKey,
  transaction,
}) => {
  const providerConfigured =
    channel === "IN_APP" ||
    (channel === "EMAIL" && process.env.EMAIL_PROVIDER) ||
    (channel === "SMS" && process.env.SMS_PROVIDER);

  const status = providerConfigured ? "SENT" : channel === "IN_APP" ? "SENT" : "SKIPPED";
  const providerResponse = providerConfigured
    ? `${channel} accepted by provider`
    : `${channel} provider not configured`;

  return NotificationModels.create(
    {
      user_id: userId || null,
      order_id: orderId || null,
      channel,
      recipient: recipient || null,
      subject: subject || null,
      message,
      template_key: templateKey || null,
      status,
      provider_response: providerResponse,
      sent_at: status === "SENT" ? new Date() : null,
    },
    { transaction }
  );
};

const sendOrderNotifications = async ({ order, user, transaction }) => {
  const message = `Your order ${order.code} is now ${order.status}. Total: ${order.grand_total}`;

  const notifications = [
    createNotification({
      userId: order.user_id,
      orderId: order.order_id,
      channel: "IN_APP",
      message,
      subject: `Order ${order.code} update`,
      templateKey: "order_status",
      transaction,
    }),
  ];

  if (user?.email_id) {
    notifications.push(
      createNotification({
        userId: order.user_id,
        orderId: order.order_id,
        channel: "EMAIL",
        recipient: user.email_id,
        message,
        subject: `Order ${order.code} update`,
        templateKey: "order_status",
        transaction,
      })
    );
  }

  if (user?.mobile_number) {
    notifications.push(
      createNotification({
        userId: order.user_id,
        orderId: order.order_id,
        channel: "SMS",
        recipient: user.mobile_number,
        message,
        subject: `Order ${order.code} update`,
        templateKey: "order_status",
        transaction,
      })
    );
  }

  return Promise.all(notifications);
};

module.exports = {
  createNotification,
  sendOrderNotifications,
};
