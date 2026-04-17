const Joi = require("joi");

const SendAdminNotificationDTO = Joi.object({
  userId: Joi.string().uuid().allow(null).optional(),
  orderId: Joi.string().uuid().allow(null).optional(),
  channel: Joi.string().valid("EMAIL", "SMS", "IN_APP").required(),
  recipient: Joi.string().allow("", null).optional(),
  subject: Joi.string().allow("", null).optional(),
  message: Joi.string().trim().required(),
  templateKey: Joi.string().allow("", null).optional(),
});

module.exports = {
  SendAdminNotificationDTO,
};
