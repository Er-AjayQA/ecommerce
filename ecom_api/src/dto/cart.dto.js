const Joi = require("joi");

const objectId = Joi.string().uuid();

const CartDTO = Joi.object({
    productId: objectId.optional(),
    variantId: objectId.allow(null).optional(),
    productVariantId: objectId.allow(null).optional(),
    quantity: Joi.number().integer().min(1).optional(),
    itemId: objectId.optional(),
});

module.exports = { CartDTO };
