const db = require("../../../../../indexRoutes/index");
const { buildMediaList, cleanupFiles } = require("../../../../../middleware/collectionMediaUpload");
const generateCode = require("../../../../../utils/generateCode");
const CollectionModels = db.Collection;
const CollectionProductModels = db.CollectionProduct;
const CollectionConditionModels = db.CollectionConditions;
const CollectionMediaModels = db.CollectionMedia;
const ProductModels = db.Product;
const ProductMediaModels = db.ProductMedia;
const ProductVariantModels = db.ProductVariant;
const ProductOptionModels = db.ProductOption;
const ProductTagModels = db.ProductTag;
const TagModels = db.Tag;
const CategoryModels = db.Category;
const VendorModels = db.Vendor;
const ProductTypeModels = db.ProductType;
const OptionValueModels = db.OptionValue;
const { Op } = require("sequelize");
const { handleDatabaseError } = require("../../../../../utils/errorHandler");

//////////////////// CREATE COLLECTION ////////////////////

exports.create_Collections = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let mediaList = null;
  try {
    const { title, description, condition_apply_type, collection_type, products, conditions } = req.body;
    const safeParse = (data) => {
      if (!data) return [];
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return [];
        }
      }
      return data;
    };

    const productsParse = safeParse(products);
    const conditionsParse = safeParse(conditions);

    const existData = await CollectionModels.findOne({
      where: { title, isDeleted: false },
      transaction,
    });
    if (existData) {
      await transaction.rollback();
      await cleanupFiles(req.files);
      return res.status(409).send({ success: false, message: "Collection already exists" });
    }

    const code = await generateCode(CollectionModels, title, "code");
    const collection = await CollectionModels.create(
      {
        title,
        code,
        description,
        condition_apply_type,
        collection_type,
      },
      { transaction },
    );

    const collectionId = collection.collection_id;

    // 🔥 MEDIA UPLOAD
    if (req.files && req.files.length > 0) {
      const tenantDbName = req.tenant ? req.tenant.dataBaseName : "default";
      const mediaList = buildMediaList(req.files, tenantDbName);
      await CollectionMediaModels.bulkCreate(
        mediaList.map((m) => ({
          collection_id: collectionId,
          url: m.url,
          type: m.type,
          position: m.position,
        })),
        { transaction },
      );
    }

    // 🔥 PRODUCTS
    if (productsParse.length > 0) {
      await CollectionProductModels.bulkCreate(
        productsParse.map((productId) => ({
          collection_id: collectionId,
          product_id: productId,
        })),
        { transaction },
      );
    }

    // 🔥 CONDITIONS
    if (conditionsParse.length > 0) {
      await CollectionConditionModels.bulkCreate(
        conditionsParse.map((item) => ({
          collection_id: collectionId,
          title: item.title,
          algorithm: item.algorithm,
          values: item.values,
        })),
        { transaction },
      );
    }

    await transaction.commit();
    return res.status(201).send({ success: true, code: 200, message: "Collection created successfully", data: collection });
  } catch (error) {
    await cleanupFiles(mediaList || req.files);
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE COLLECTION ////////////////////

exports.update_Collections = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let mediaList = null;
  try {
    const collectionId = req.params.id;
    const { title, description, condition_apply_type, collection_type, products, conditions, existing_images } = req.body;

    const safeParse = (data) => {
      if (!data) return [];
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return [];
        }
      }
      return data;
    };

    const productsParse = safeParse(products);
    const conditionsParse = safeParse(conditions);
    const existingImagesParse = safeParse(existing_images);

    const collection = await CollectionModels.findOne({
      where: { collection_id: collectionId, isDeleted: false },
      transaction,
    });
    if (!collection) {
      await transaction.rollback();
      await cleanupFiles(req.files);
      return res.status(404).send({ success: false, code: 404, message: "Collection not found" });
    }

    // 🔥 Update Collection
    await collection.update(
      {
        title,
        description,
        condition_apply_type,
        collection_type,
      },
      { transaction },
    );

    if (existingImagesParse?.length > 0) {
      const ids = existingImagesParse.map((img) => img.id);
      await CollectionMediaModels.destroy({
        where: {
          collection_id: collectionId,
          collection_media_id: { [db.Sequelize.Op.notIn]: ids },
        },
        transaction,
      });
    } else {
      await CollectionMediaModels.destroy({
        where: { collection_id: collectionId },
        transaction,
      });
    }

    if (req.files?.length > 0) {
      const tenantDbName = req.tenant ? req.tenant.dataBaseName : "default";
      mediaList = buildMediaList(req.files, tenantDbName);
      for (const m of mediaList) {
        await CollectionMediaModels.create(
          {
            collection_id: collectionId,
            url: m.url,
            type: m.type,
            position: m.position,
          },
          { transaction },
        );
      }
    }

    // 🔥 PRODUCTS (Replace)
    await CollectionProductModels.destroy({
      where: { collection_id: collectionId },
      transaction,
    });
    if (productsParse.length > 0) {
      await CollectionProductModels.bulkCreate(
        productsParse.map((productId) => ({
          collection_id: collectionId,
          product_id: productId,
        })),
        { transaction },
      );
    }

    // 🔥 CONDITIONS (Replace)
    await CollectionConditionModels.destroy({
      where: { collection_id: collectionId },
      transaction,
    });

    if (conditionsParse.length > 0) {
      await CollectionConditionModels.bulkCreate(
        conditionsParse.map((item) => ({
          collection_id: collectionId,
          title: item.title,
          algorithm: item.algorithm,
          values: item.values,
        })),
        { transaction },
      );
    }

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Collection Updated Successfully" });
  } catch (error) {
    await cleanupFiles(mediaList || req.files);
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE STATUS COLLECTION ////////////////////

exports.update_Status_Collections = async (req, res) => {
  try {
    const collectionid = req.params.id;
    const { status } = req.body;
    const collerction = await CollectionModels.findOne({ where: { collection_id: collectionid } });
    if (!collerction) {
      return res.status(404).send({ success: false, code: 404, message: "Collection not found" });
    }
    await collerction.update({
      status: status === "DRAFT" ? "PUBLISHED" : "DRAFT",
    });
    return res.status(200).send({ success: true, code: 200, message: "Collection status updated successfully", data: collerction });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL COLLECTION ////////////////////

exports.get_All_Collections = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", statusBy = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {
      isDeleted: false,
    };

    if (search) {
      whereCondition.title = {
        [Op.like]: `%${search}%`,
      };
    }
    if (statusBy) {
      whereCondition.status = {
        [Op.like]: `%${statusBy}%`,
      };
    }

    const { count, rows } = await CollectionModels.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: CollectionProductModels,
          as: "products",
        },
        {
          model: CollectionConditionModels,
          as: "conditions",
        },
        {
          model: CollectionMediaModels,
          as: "media",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).send({
      success: true,
      code: 200,
      totalRecords: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET BYID COLLECTION ////////////////////

exports.get_ById_Collections = async (req, res) => {
  try {
    const collectionsId = req.params.id;
    const getData = await CollectionModels.findOne({
      where: {
        isDeleted: false,
        [Op.or]: [{ collection_id: collectionsId }, { code: collectionsId }],
      },
      include: [
        {
          model: CollectionProductModels,
          as: "products",
          attributes: ["product_id"],
        },
        {
          model: CollectionConditionModels,
          as: "conditions",
        },
        {
          model: CollectionMediaModels,
          as: "media",
        },
      ],
    });

    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Collection not found" });
    }

    const responseData = getData.toJSON();
    responseData.products = responseData.products.map(
      (item) => item.product_id,
    );
    return res.status(200).send({ success: true, code: 200, message: "Fetch Data successfully", data: responseData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET COLLECTION PRODUCTS ////////////////////

exports.get_Collection_Products = async (req, res) => {
  try {
    const collectionId = req.params.id;
    const { page = 1, limit = 12, statusBy = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const collection = await CollectionModels.findOne({
      where: {
        isDeleted: false,
        [Op.or]: [{ collection_id: collectionId }, { code: collectionId }],
      },
    });

    if (!collection) {
      return res.status(404).send({ success: false, code: 404, message: "Collection not found" });
    }

    const productWhere = {
      isDeleted: false,
    };

    if (statusBy) {
      productWhere.status = statusBy;
    }

    const { count, rows } = await CollectionProductModels.findAndCountAll({
      where: {
        collection_id: collection.collection_id,
        isDeleted: false,
      },
      include: [
        {
          model: ProductModels,
          as: "product",
          required: true,
          where: productWhere,
          include: [
            {
              model: ProductMediaModels,
              as: "media",
            },
            {
              model: ProductVariantModels,
              as: "variants",
              include: [
                {
                  model: OptionValueModels,
                  as: "optionValues",
                },
              ],
            },
            {
              model: ProductOptionModels,
              as: "options",
              include: [
                {
                  model: OptionValueModels,
                  as: "OptionValues",
                },
              ],
            },
            {
              model: ProductTagModels,
              as: "tags",
              include: [
                {
                  model: TagModels,
                  as: "tag",
                },
              ],
            },
            {
              model: CategoryModels,
              as: "category",
            },
            {
              model: VendorModels,
              as: "vendors",
            },
            {
              model: ProductTypeModels,
              as: "product_types",
            },
            {
              model: CollectionProductModels,
              as: "collectionProducts",
              include: [
                {
                  model: CollectionModels,
                  as: "collection",
                },
              ],
            },
          ],
        },
      ],
      limit: Number(limit),
      offset,
      order: [["order_by", "ASC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetch Collection Products Successfully",
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows.map((row) => row.product).filter(Boolean),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// DELETE COLLECTION ////////////////////

exports.delete_Collection = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const collectionId = req.params.id;
    const collection = await CollectionModels.findOne({
      where: { collection_id: collectionId, isDeleted: false },
      transaction,
    });
    if (!collection) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Collection not found" });
    }
    await collection.update({ isDeleted: true }, { transaction });
    await CollectionProductModels.update(
      { isDeleted: true },
      { where: { collection_id: collectionId }, transaction },
    );
    await CollectionConditionModels.update(
      { isDeleted: true },
      { where: { collection_id: collectionId }, transaction },
    );
    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Collection Updated Status Successfully" });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
