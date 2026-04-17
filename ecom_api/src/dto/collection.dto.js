const Joi = require("joi");

const objectId = Joi.number().integer().positive();

const CollectionDTO = Joi.object({
    title: Joi.string().trim().min(2).max(255).required(),
    description: Joi.string().allow("", null).optional(),
    condition_apply_type: Joi.string().valid("ALL", "ANY").optional(),
    collection_type: Joi.string().valid("MANUAL", "SMART").optional(),
    existing_images: Joi.alternatives()
        .try(
            Joi.array().items(
                Joi.object({
                    id: Joi.string().guid().required(),
                    url: Joi.string().uri().optional(),
                }),
            ),
            Joi.string(),
        )
        .optional()
        .default([]),

    products: Joi.alternatives().try(
        Joi.array().items(objectId),
        Joi.string()
    ).optional(),

    conditions: Joi.alternatives().try(
        Joi.array().items(
            Joi.object({
                title: Joi.string().required(),
                algorithm: Joi.string().required(),
                values: Joi.alternatives().try(
                    Joi.array().items(Joi.string()),
                    Joi.string()
                ).required()
            })
        ),
        Joi.string()
    ).optional()
});

module.exports = { CollectionDTO };