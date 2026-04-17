const db = require("../../../../../indexRoutes/index");
const CategoryModels = db.Category;
const { handleDatabaseError } = require("../../../../../utils/errorHandler");

//////////////////// CREATECATEGORY ////////////////////

exports.create_Category = async (req, res) => {
  try {
    const { category_name, parent_id } = req.body;
    let level = 1;
    if (parent_id) {
      const parent = await CategoryModels.findByPk(parent_id);
      if (!parent) {
        return res.status(400).send({ success: false, code: 400, message: "Parent not found" });
      }
      level = parent.level + 1;
      if (level > 3) {
        return res.status(400).send({ success: false, code: 400, message: "Only 3 levels allowed" });
      }
    }

    const createData = await CategoryModels.create({
      category_name,
      parent_id: parent_id || null,
      level,
    });

    return res.status(201).send({ success: true, code: 200, message: "Category Created Susscessfully", data: createData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE CATEGPRY ////////////////////

exports.update_Category = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name } = req.body;
    const getData = await CategoryModels.findByPk(categoryId);
    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Record Not found" });
    }
    await CategoryModels.update({ category_name }, { where: { category_id: categoryId } });
    return res.status(200).send({ success: true, code: 200, message: "Updated Category Successfully", data: getData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE STATUS CATEGORY ////////////////////

exports.update_Status_Category = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { status } = req.body;
    const getData = await CategoryModels.findByPk(categoryId);
    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Record Not found" });
    }
    await CategoryModels.update({ status }, { where: { category_id: categoryId } });
    return res.status(200).send({ success: true, code: 200, message: "Updated Status Successfully", data: getData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL CATEGORY ////////////////////

exports.get_All_Category = async (req, res) => {
  try {
    const data = await CategoryModels.findAll({
      order: [["order_by", "ASC"]],
      raw: true,
    });

    const map = {};
    const tree = [];

    data.forEach((item) => {
      map[item.product_code] = {
        ...item,
        children: [],
      };
    });

    const getParentCode = (item) => {
      if (!item.parent_id) return null;
      if (item.parent_id === item.product_code) {
        const parts = item.product_code.split("-");
        parts.pop();
        return parts.join("-");
      }
      return item.parent_id;
    };

    data.forEach((item) => {
      const node = map[item.product_code];
      const parentCode = getParentCode(item);
      if (!parentCode || item.level === 1) {
        tree.push(node);
        return;
      }
      const parent = map[parentCode];
      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    });
    return res.status(200).send({ success: true, code: 200, message: "Fetch All Category Data Successfully", data: tree });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET BYID CATEGORY ////////////////////

exports.get_ById_Category = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const getData = await CategoryModels.findByPk(categoryId, {
      include: [
        {
          model: CategoryModels,
          as: "children",
        },
      ],
    });
    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Record Not found" });
    }
    return res.status(200).send({ success: true, code: 200, message: "Fetch Category Data Successfully", data: getData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};