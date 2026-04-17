const Joi = require("joi");

const objectId = Joi.string().uuid();

const OrderDTO = Joi.object({
    shippingAddressId: objectId.required(),
    billingAddressId: objectId.optional(),
    couponCode: Joi.string().trim().uppercase().optional(),
});

module.exports = { OrderDTO };
