const Joi = require("joi");

const UpdateAdminOrderStatusDTO = Joi.object({
  status: Joi.string().valid("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").required(),
  title: Joi.string().trim().optional(),
  description: Joi.string().allow("", null).optional(),
  location: Joi.string().allow("", null).optional(),
  trackingNumber: Joi.string().allow("", null).optional(),
});

const UpdateAdminPaymentStatusDTO = Joi.object({
  payment_status: Joi.string().valid("PENDING", "COMPLETED", "FAILED", "REFUNDED").required(),
});

module.exports = {
  UpdateAdminOrderStatusDTO,
  UpdateAdminPaymentStatusDTO,
};
