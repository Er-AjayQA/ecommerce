const db = require("../../../../../indexRoutes/index");
const generateCode = require("../../../../../utils/generateCode");
const ProductType = db.ProductType;

exports.create_product_types = async (req, res) => {
  try {
    const { product_type_name } = req.body;
    const exist = await ProductType.findOne({ where: { product_type_name, isDeleted: false } });
    if (exist) {
      return res.status(409).send({ success: false, message: "Type already exists" });
    }
    const code = await generateCode(ProductType, product_type_name, "code");
    const data = await ProductType.create({
      product_type_name,
      code: code,
    });
    return res.status(201).send({ success: true, message: "Type created successfully", data });
  } catch (error) {
    console.log("Error:", error)
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

exports.getAll_product_types = async (req, res) => {
  try {
    const data = await ProductType.findAll({ where: { isDeleted: false }, order: [["createdAt", "DESC"]] });
    return res.send({ success: true, count: data.length, data });
  } catch (error) {
    console.log("Error:", error)
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

exports.getById_product_types = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ProductType.findOne({ where: { product_type_id: id, isDeleted: false } });
    if (!data) {
      return res.status(404).send({ success: false, message: "Type not found" });
    }
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error:", error)
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};
