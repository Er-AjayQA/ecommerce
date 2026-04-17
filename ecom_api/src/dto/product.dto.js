const Joi = require("joi");

const updateProductSchema = Joi.object({
  title: Joi.string().trim().min(1).optional(),
  description: Joi.string().optional().allow(""),
  price: Joi.number().min(0).optional(),
  vendor: Joi.string().trim().optional().allow(""),
  product_type: Joi.string().trim().optional().allow(""),
}).min(1);

const optionValueSchema = Joi.object({
  option: Joi.string().trim().required().messages({
    "string.empty": "Option name is required in option_values",
    "any.required": "Option name is required in option_values",
  }),
  value: Joi.string().trim().required().messages({
    "string.empty": "Option value is required in option_values",
    "any.required": "Option value is required in option_values",
  }),
});

const variantSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Variant title is required",
    "any.required": "Variant title is required",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Variant price must be a number",
    "number.min": "Variant price cannot be negative",
    "any.required": "Variant price is required",
  }),
  sku: Joi.string().trim().allow(null, "").optional(),
  compare_price: Joi.number().min(0).allow(null).optional().messages({
    "number.min": "Compare price cannot be negative",
  }),
  cost: Joi.number().min(0).allow(null).optional().messages({
    "number.min": "Cost cannot be negative",
  }),
  barcode: Joi.string().trim().allow(null, "").optional(),
  weight: Joi.number().min(0).allow(null).optional(),
  inventory_quantity: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Inventory quantity must be a number",
    "number.integer": "Inventory quantity must be an integer",
    "number.min": "Inventory quantity cannot be negative",
  }),
  option_values: Joi.array().items(optionValueSchema).optional().default([]),
});

const optionSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Option name is required",
    "any.required": "Option name is required",
  }),
  values: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      "array.min": "Option must have at least one value",
      "any.required": "Option values are required",
    }),
});

const createProductSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    "string.empty": "Product title is required",
    "any.required": "Product title is required",
  }),
  description: Joi.string().allow(null, "").optional(),
  status: Joi.string()
    .trim()
    .valid("ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED", "ARCHIVED")
    .default("DRAFT")
    .messages({
      "any.only": "Status must be one of: DRAFT, ACTIVE, PUBLISHED, ARCHIVED",
    }),
  product_type_id: Joi.string()
    .trim()
    .guid()
    .allow(null, "")
    .optional()
    .messages({
      "string.guid": "Product type ID must be a valid UUID",
    }),
  vendor_id: Joi.string().trim().guid().allow(null, "").optional().messages({
    "string.guid": "Vendor ID must be a valid UUID",
  }),
  category_id: Joi.string().trim().guid().allow(null, "").optional().messages({
    "string.guid": "category ID must be a valid UUID",
  }),
  price: Joi.string().allow(null, "").optional().messages({
    "string.base": "Price must be a string",
  }),
  sku: Joi.string().trim().allow(null, "").optional(),
  compare_price: Joi.number().min(0).allow(null).optional().messages({
    "number.min": "Compare price cannot be negative",
  }),
  cost: Joi.number().min(0).allow(null).optional().messages({
    "number.min": "Cost cannot be negative",
  }),
  barcode: Joi.string().trim().allow(null, "").optional(),
  weight: Joi.number().min(0).allow(null).optional(),
  inventory_quantity: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .optional()
    .default(0)
    .messages({
      "number.base": "Inventory quantity must be a number",
      "number.integer": "Inventory quantity must be an integer",
      "number.min": "Inventory quantity cannot be negative",
    }),

  options: Joi.alternatives()
    .try(Joi.array().items(optionSchema), Joi.string())
    .optional()
    .default([]),

  variants: Joi.alternatives()
    .try(Joi.array().items(variantSchema), Joi.string())
    .optional()
    .default([]),

  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional()
    .default([]),

  collections: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional()
    .default([]),

  price: Joi.number().min(0).allow(null).optional(),
  categories: Joi.array()
    .items(
      Joi.string().trim().guid().messages({
        "string.base": "Category ID must be a valid UUID string",
        "string.guid": "Category ID must be a valid UUID",
        "string.empty": "Category ID cannot be empty",
      }),
    )
    .optional()
    .default([]),
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
})
  .custom((value, helpers) => {
    const hasVariants = value.variants && value.variants.length > 0;
    if (!hasVariants && (value.price == null || value.price < 0)) {
      return helpers.error("any.custom", {
        message: "Price is required when no variants are provided",
      });
    }
    return value;
  })
  .messages({
    "any.custom": "{{#message}}",
  });

module.exports = {
  createProductSchema,
  updateProductSchema,
};
