const Joi = require("joi");

const objectId = Joi.string().uuid();

const WishlistDTO = Joi.object({
    productId: objectId.required(),
    productVariantId: objectId.allow(null).optional(),
});

module.exports = { WishlistDTO };
