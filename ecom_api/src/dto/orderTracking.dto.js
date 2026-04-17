const Joi = require("joi");

const UpdateOrderStatusDTO = Joi.object({
  status: Joi.string().valid("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").required(),
  title: Joi.string().trim().optional(),
  description: Joi.string().allow("", null).optional(),
  location: Joi.string().allow("", null).optional(),
  trackingNumber: Joi.string().allow("", null).optional(),
});

const CreateTrackingEventDTO = Joi.object({
  status: Joi.string().valid("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").required(),
  title: Joi.string().trim().required(),
  description: Joi.string().allow("", null).optional(),
  location: Joi.string().allow("", null).optional(),
  eventTime: Joi.date().optional(),
});

module.exports = {
  UpdateOrderStatusDTO,
  CreateTrackingEventDTO,
};
