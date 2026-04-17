const db = require("../indexRoutes/index");

const OrderTrackingEventModels = db.OrderTrackingEventModels;

const allowedTransitions = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const assertValidStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) return;
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}`);
  }
};

const createTrackingEvent = async ({
  orderId,
  status,
  title,
  description,
  location,
  createdBy,
  eventTime,
  transaction,
}) => {
  return OrderTrackingEventModels.create(
    {
      order_id: orderId,
      status,
      title,
      description,
      location,
      created_by: createdBy || null,
      event_time: eventTime || new Date(),
      is_customer_visible: true,
    },
    { transaction }
  );
};

module.exports = {
  assertValidStatusTransition,
  createTrackingEvent,
};
