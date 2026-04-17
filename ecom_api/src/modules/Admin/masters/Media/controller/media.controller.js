const db = require("../../../../../indexRoutes/index");
const CollectionModels = db.Collection;
const CollectionProductModels = db.CollectionProduct;
const CollectionConditionModels = db.CollectionConditions;
const ProductMediaModels = db.ProductMedia;
const CollectionMediaModels = db.CollectionMedia;
const { Op } = require("sequelize");

const MODEL_TYPE = {
  product: ProductMediaModels,
  collection: CollectionMediaModels,
};

const MAP_ID = {
  product: "product_id",
  collection: "collection_id",
};

//////////////////// GET ALL MEDIA ////////////////////

exports.get_All_Media = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    let whereCondition = {
      isDeleted: false,
      [MAP_ID[type]]: id,
    };

    console.log("MODEL USED", MODEL_TYPE[type]);

    const { count, rows } = await MODEL_TYPE[type].findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      totalRecords: count,
      data: rows,
    });
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .send({ success: false, code: 500, message: "Internal Server Error" });
  }
};
