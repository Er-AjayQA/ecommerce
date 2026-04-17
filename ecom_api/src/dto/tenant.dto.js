const Joi = require('joi');

const registerTenantUserSchema = Joi.object({
  organizationName: Joi.string().trim().min(1).required().messages({
    'string.base': 'Organization name must be a string',
    'string.empty': 'Organization name is required',
    'any.required': 'Organization name is required'
  }),
  domain: Joi.string().trim().min(1).required().messages({
    'string.base': 'Domain must be a string',
    'string.empty': 'Domain is required',
    'any.required': 'Domain is required'
  }),
  name: Joi.string().trim().min(1).required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/).required().messages({
    'string.base': 'Phone must be a string',
    'string.pattern.base': 'Phone must be 10-15 digits',
    'string.empty': 'Phone is required',
    'any.required': 'Phone is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  package_details: Joi.any().optional()
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  otp: Joi.string().required().messages({
    'string.base': 'OTP must be a string',
    'any.required': 'OTP is required'
  })
});

const loginTenantUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password is required',
    'any.required': 'Password is required'
  })
});

const addTenantUserSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'any.required': 'Name is required'
  }),
  email_id: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Valid email_id is required',
    'any.required': 'Email_id is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least {#limit} characters',
    'any.required': 'Password is required'
  }),
  mobile_number: Joi.string().trim().pattern(/^[0-9]{10,15}$/).optional().messages({
    'string.pattern.base': 'Mobile number must be 10-15 digits'
  }),
  role_id: Joi.string().uuid().optional()
});

const resendOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'any.required': 'Email is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

const customerOtpRequestSchema = Joi.object({
  mode: Joi.string().valid("login", "register").default("login"),
  identifier: Joi.string().trim().required(),
  name: Joi.string().trim().allow("", null).optional(),
  subscribeNewsletter: Joi.boolean().optional(),
});

const customerOtpVerifySchema = Joi.object({
  identifier: Joi.string().trim().required(),
  otp: Joi.string().trim().required(),
});

module.exports = {
  registerTenantUserSchema,
  verifyOtpSchema,
  loginTenantUserSchema,
  addTenantUserSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  customerOtpRequestSchema,
  customerOtpVerifySchema
};

