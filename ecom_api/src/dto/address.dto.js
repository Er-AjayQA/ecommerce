const Joi = require("joi");

const AddressDTO = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: Joi.string().allow(null, "").optional(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null, "").optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().required(),
    type: Joi.string().valid("SHIPPING", "BILLING").optional(),
    is_default: Joi.boolean().optional(),
});

module.exports = { AddressDTO };
