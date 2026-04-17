const db = require("../../../../indexRoutes/index");
const generateCode = require("../../../../utils/generateCode");
const { Op } = require("sequelize");
const { handleDatabaseError } = require("../../../../utils/errorHandler");

const MenuModels = db.Menu;
const MenuItemModels = db.MenuItem;

const safeParse = (data) => {
  if (!data) return [];
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return Array.isArray(data) ? data : [];
};

const buildMenuTree = (items = [], parentId = null) => {
  return items
    .filter(
      (item) =>
        String(item.parent_id || "") === String(parentId || "") ||
        (!item.parent_id && !parentId),
    )
    .sort((a, b) => a.order_by - b.order_by)
    .map((item) => ({
      ...item,
      children: buildMenuTree(items, item.menu_item_id),
    }));
};

const validateMenuItems = (menuItems = []) => {
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return "At least one menu item is required";
  }

  for (const item of menuItems) {
    if (!item.menu_label || !String(item.menu_label).trim()) {
      return "Menu item label is required";
    }

    if (!item.menu_link || !String(item.menu_link).trim()) {
      return "Menu item link is required";
    }

    const level = Number(item.level || 1);
    if (![1, 2, 3].includes(level)) {
      return "Menu item level must be 1, 2, or 3";
    }
  }

  return null;
};

//////////////////// CREATE MENU ////////////////////

exports.create_Menus = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { name, status = "DRAFT", menuItems } = req.body;

    if (!name || !String(name).trim()) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Menu name is required",
      });
    }

    const parsedMenuItems = safeParse(menuItems);
    const menuItemsError = validateMenuItems(parsedMenuItems);

    if (menuItemsError) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: menuItemsError,
      });
    }

    const existData = await MenuModels.findOne({
      where: {
        name: name.trim(),
        isDeleted: false,
      },
      transaction,
    });

    if (existData) {
      await transaction.rollback();
      return res.status(409).send({
        success: false,
        code: 409,
        message: "Menu already exists",
      });
    }

    const code = await generateCode(MenuModels, name, "code");

    const lastMenu = await MenuModels.findOne({
      where: { isDeleted: false },
      order: [["order_by", "DESC"]],
      transaction,
    });

    const menu = await MenuModels.create(
      {
        name: name.trim(),
        code,
        status,
        order_by: lastMenu ? lastMenu.order_by + 1 : 1,
      },
      { transaction },
    );

    const tempIdToDbIdMap = {};

    const sortedItems = [...parsedMenuItems].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.order_by - b.order_by;
    });

    for (const item of sortedItems) {
      const parentId =
        item.parent_id && tempIdToDbIdMap[item.parent_id]
          ? tempIdToDbIdMap[item.parent_id]
          : null;

      const itemCode = await generateCode(
        MenuItemModels,
        item.menu_label,
        "code",
      );

      const createdItem = await MenuItemModels.create(
        {
          menu_id: menu.menu_id,
          menu_label: item.menu_label,
          menu_link: item.menu_link,
          parent_id: parentId,
          level: item.level || 1,
          order_by: item.order_by || 1,
          code: itemCode,
          status: status || "DRAFT",
        },
        { transaction },
      );

      if (item.temp_id) {
        tempIdToDbIdMap[item.temp_id] = createdItem.menu_item_id;
      }
    }

    await transaction.commit();

    return res.status(201).send({
      success: true,
      code: 201,
      message: "Menu created successfully",
      data: menu,
    });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE MENU ////////////////////

exports.update_Menus = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const menuId = req.params.id;
    const { name, status = "DRAFT", menuItems } = req.body;

    const parsedMenuItems = safeParse(menuItems);

    if (!name || !String(name).trim()) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Menu name is required",
      });
    }

    const menuItemsError = validateMenuItems(parsedMenuItems);

    if (menuItemsError) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        code: 400,
        message: menuItemsError,
      });
    }

    const menu = await MenuModels.findOne({
      where: {
        menu_id: menuId,
        isDeleted: false,
      },
      transaction,
    });

    if (!menu) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Menu not found",
      });
    }

    const duplicateMenu = await MenuModels.findOne({
      where: {
        menu_id: { [Op.ne]: menuId },
        name: name.trim(),
        isDeleted: false,
      },
      transaction,
    });

    if (duplicateMenu) {
      await transaction.rollback();
      return res.status(409).send({
        success: false,
        code: 409,
        message: "Another menu with this name already exists",
      });
    }

    await menu.update(
      {
        name: name.trim(),
        status,
      },
      { transaction },
    );

    await MenuItemModels.destroy({
      where: { menu_id: menuId },
      transaction,
    });

    const tempIdToDbIdMap = {};

    const sortedItems = [...parsedMenuItems].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.order_by - b.order_by;
    });

    for (const item of sortedItems) {
      const parentId =
        item.parent_id && tempIdToDbIdMap[item.parent_id]
          ? tempIdToDbIdMap[item.parent_id]
          : null;

      const itemCode = await generateCode(
        MenuItemModels,
        item.menu_label,
        "code",
      );

      const createdItem = await MenuItemModels.create(
        {
          menu_id: menuId,
          menu_label: item.menu_label,
          menu_link: item.menu_link,
          parent_id: parentId,
          level: item.level || 1,
          order_by: item.order_by || 1,
          code: itemCode,
          status: status || "DRAFT",
        },
        { transaction },
      );

      if (item.temp_id) {
        tempIdToDbIdMap[item.temp_id] = createdItem.menu_item_id;
      }
    }

    await transaction.commit();

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Menu updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE STATUS MENU ////////////////////

exports.update_Status_Menus = async (req, res) => {
  try {
    const menuId = req.params.id;

    const menu = await MenuModels.findOne({
      where: { menu_id: menuId, isDeleted: false },
    });

    if (!menu) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Menu not found",
      });
    }

    await menu.update({
      status: menu.status === "DRAFT" ? "PUBLISHED" : "DRAFT",
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Menu status updated successfully",
      data: menu,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL MENU ////////////////////

exports.get_All_Menus = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", statusBy = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereCondition = {
      isDeleted: false,
    };

    if (search) {
      whereCondition.name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (statusBy) {
      whereCondition.status = statusBy;
    }

    const { count, rows } = await MenuModels.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: MenuItemModels,
          as: "menuItems",
          where: { isDeleted: false },
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
      distinct: true,
    });

    return res.status(200).send({
      success: true,
      code: 200,
      totalRecords: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET BYID MENU ////////////////////

exports.get_ById_Menus = async (req, res) => {
  try {
    const menuId = req.params.id;

    const getData = await MenuModels.findOne({
      where: {
        menu_id: menuId,
        isDeleted: false,
      },
      include: [
        {
          model: MenuItemModels,
          as: "menuItems",
          where: { isDeleted: false },
          required: false,
          order: [
            ["level", "ASC"],
            ["order_by", "ASC"],
          ],
        },
      ],
    });

    if (!getData) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Menu not found",
      });
    }

    const responseData = getData.toJSON();
    responseData.menuItems = buildMenuTree(responseData.menuItems || []);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetch data successfully",
      data: responseData,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// DELETE MENU ////////////////////

exports.delete_Menu = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const menuId = req.params.id;

    const menu = await MenuModels.findOne({
      where: {
        menu_id: menuId,
        isDeleted: false,
      },
      transaction,
    });

    if (!menu) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Menu not found",
      });
    }

    await menu.update(
      {
        isDeleted: true,
        isActive: false,
      },
      { transaction },
    );

    await MenuItemModels.update(
      {
        isDeleted: true,
        isActive: false,
      },
      {
        where: { menu_id: menuId },
        transaction,
      },
    );

    await transaction.commit();

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
