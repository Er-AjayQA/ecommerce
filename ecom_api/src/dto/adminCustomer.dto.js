const Joi = require("joi");

const UpdateCustomerStatusDTO = Joi.object({
  status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  UpdateCustomerStatusDTO,
};
