const Joi = require("joi");

const CouponCreateDTO = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().allow("", null).optional(),
  discount_type: Joi.string().valid("PERCENTAGE", "FIXED").required(),
  discount_value: Joi.number().positive().required(),
  min_order_amount: Joi.number().min(0).optional(),
  max_discount_amount: Joi.number().min(0).allow(null).optional(),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
  usage_limit_per_user: Joi.number().integer().min(1).allow(null).optional(),
  starts_at: Joi.date().allow(null).optional(),
  ends_at: Joi.date().allow(null).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "EXPIRED").optional(),
});

const CouponUpdateDTO = Joi.object({
  name: Joi.string().trim().optional(),
  code: Joi.string().trim().uppercase().optional(),
  description: Joi.string().allow("", null).optional(),
  discount_type: Joi.string().valid("PERCENTAGE", "FIXED").optional(),
  discount_value: Joi.number().positive().optional(),
  min_order_amount: Joi.number().min(0).optional(),
  max_discount_amount: Joi.number().min(0).allow(null).optional(),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
  usage_limit_per_user: Joi.number().integer().min(1).allow(null).optional(),
  starts_at: Joi.date().allow(null).optional(),
  ends_at: Joi.date().allow(null).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "EXPIRED").optional(),
}).min(1);

const ApplyCouponDTO = Joi.object({
  couponCode: Joi.string().trim().uppercase().required(),
});

module.exports = {
  CouponCreateDTO,
  CouponUpdateDTO,
  ApplyCouponDTO,
};
