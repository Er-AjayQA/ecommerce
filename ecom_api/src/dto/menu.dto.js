const Joi = require("joi");

const MenuItemSchema = Joi.object({
  temp_id: Joi.string().optional(),
  menu_label: Joi.string().trim().min(1).max(255).required(),
  menu_link: Joi.string().trim().required(),
  parent_id: Joi.alternatives()
    .try(Joi.string(), Joi.number().integer().positive(), Joi.valid(null))
    .optional(),
  level: Joi.number().integer().min(1).required(),
  order_by: Joi.number().integer().min(1).required(),
});

const MenuDTO = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "INACTIVE").optional(),
  menuItems: Joi.alternatives()
    .try(Joi.array().items(MenuItemSchema), Joi.string())
    .optional(),
});

module.exports = { MenuDTO };
