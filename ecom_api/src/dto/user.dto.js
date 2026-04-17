const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email_id: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role_id: Joi.string().uuid().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  email_id: Joi.string().trim().lowercase().email().optional(),
  mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role_id: Joi.string().uuid().optional(),
  status: Joi.string().valid('active', 'inactive').optional()
}).min(1); // At least one field required

module.exports = {
  createUserSchema,
  updateUserSchema
};

