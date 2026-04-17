const db = require("../../../../indexRoutes/index");
const ProductModels = db.Product;
const ProductMediaModels = db.ProductMedia;
const ProductVariantModels = db.ProductVariant;
const ProductOptionModels = db.ProductOption;
const OptionValueModels = db.OptionValue;
const VariantOptionValueModels = db.VariantOptionValue;
const ProductTagModels = db.ProductTag;
const TagModels = db.Tag;
const VendorModels = db.Vendor;
const ProductTypeModels = db.ProductType;
const CollectionProductModels = db.CollectionProduct;
const CategoryModels = db.Category;
const CollectionModels = db.Collection;
const InventoryItemModels = db.InventoryItem;
const generateCode = require("../../../../utils/generateCode");
const { buildMediaList, cleanupFiles } = require("../../../../middleware/productMediaUpload");
const { createProductSchema } = require("../../../../dto/product.dto");
const { Op } = require("sequelize");
const { handleDatabaseError } = require("../../../../utils/errorHandler");


const FIELD_MAP = {
  title: "title",
  category: "category_id",
  vendor: "vendor_id",
  type: "product_type_id",
  price: "$variants.price$",
  inventory_stock: "$variants.inventory_quantity$",
  tag: "$tags.tag_id$",
};

const NUMBER_FIELDS = ["price", "inventory_stock"];

const OPERATOR_MAP = {
  contains: (val) => ({ [Op.like]: `%${val}%` }),
  not_contains: (val) => ({ [Op.notLike]: `%${val}%` }),

  is_equal_to: (val) => val,
  is_not_equal_to: (val) => ({ [Op.ne]: val }),

  starts_with: (val) => ({ [Op.like]: `${val}%` }),
  ends_with: (val) => ({ [Op.like]: `%${val}` }),

  is_greater_than: (val) => ({ [Op.gt]: val }),
  is_less_than: (val) => ({ [Op.lt]: val }),

  in: (val) => ({ [Op.in]: Array.isArray(val) ? val : [val] }),
  not_in: (val) => ({ [Op.notIn]: Array.isArray(val) ? val : [val] }),
};

//////////////////// GET OPERATOR SYMBOL ////////////////////

function getOperatorSymbol(condition) {
  if (condition && condition[Op.gt]) return ">";
  if (condition && condition[Op.lt]) return "<";
  if (condition && condition[Op.gte]) return ">=";
  if (condition && condition[Op.lte]) return "<=";
  if (condition && condition[Op.ne]) return "!=";
  return "=";
};

//////////////////// BUILD WHERE CLAUSE ////////////////////

const buildWhereClause = (conditions = [], applyType = "all") => {
  if (!conditions?.length) return {};

  const tagConditions = [];
  const otherConditions = [];

  conditions.forEach((condition) => {
    if (condition.title === "tag") {
      tagConditions.push(condition);
    } else {
      otherConditions.push(condition);
    }
  });

  const whereClauses = [];

  if (tagConditions.length > 0) {
    if (applyType === "all") {
      const tagExistsClauses = tagConditions.map((condition) => {
        const tagValue = Array.isArray(condition.values)
          ? condition.values[0]
          : condition.values;
        return db.sequelize.literal(`
          EXISTS (
            SELECT 1 FROM product_tags pt
            WHERE pt.product_id = Product.product_id
            AND pt.tag_id = '${tagValue}'
          )
        `);
      });

      whereClauses.push({
        [Op.and]: tagExistsClauses,
      });
    } else {
      const allTagValues = tagConditions.flatMap((c) =>
        Array.isArray(c.values) ? c.values : [c.values],
      );

      whereClauses.push({
        "$tags.tag_id$": {
          [Op.in]: allTagValues,
        },
      });
    }
  }

  if (otherConditions.length > 0) {
    const otherFilters = otherConditions
      .map((condition) => {
        const { title, algorithm, values } = condition;
        let field = FIELD_MAP[title];
        let operatorFn = OPERATOR_MAP[algorithm];

        if (!field || !operatorFn) return null;

        let processedValues = values;
        if (NUMBER_FIELDS.includes(title)) {
          processedValues = Array.isArray(values)
            ? values.map(Number)
            : Number(values);
        }

        if (
          ["category", "vendor", "type"].includes(title) &&
          !Array.isArray(processedValues)
        ) {
          processedValues = [processedValues];
        }

        if (
          field === "$variants.price$" ||
          field === "$variants.inventory_quantity$"
        ) {
          const variantField =
            field === "$variants.price$" ? "price" : "inventory_quantity";
          return db.sequelize.literal(`
          EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = Product.product_id
            AND pv.${variantField} ${getOperatorSymbol(operatorFn(processedValues))} ${Array.isArray(processedValues) ? processedValues[0] : processedValues}
          )
        `);
        }

        return { [field]: operatorFn(processedValues) };
      })
      .filter(Boolean);

    if (otherFilters.length > 0) {
      if (applyType === "all") {
        whereClauses.push({
          [Op.and]: otherFilters,
        });
      } else {
        whereClauses.push({
          [Op.or]: otherFilters,
        });
      }
    }
  }

  if (whereClauses.length === 0) return {};

  if (applyType === "all") {
    return {
      [Op.and]: whereClauses,
    };
  } else {
    return {
      [Op.or]: whereClauses,
    };
  }
};

//////////////////// VALIDATION REQUEST ////////////////////

function validateRequest(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (error) {
    return {
      isValid: false,
      message: error.details[0]?.message || "Validation failed",
    };
  }
  return { isValid: true, value };
};

//////////////////// CREATE PRODUCT ////////////////////

exports.create_Product = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let mediaList = null;

  try {
    const rawPayload = req.body.data ? JSON.parse(req.body.data) : req.body;
    const validation = validateRequest(createProductSchema, rawPayload);
    if (!validation.isValid) {
      await cleanupFiles(req.files);
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: validation.message });
    }

    const { title, description, status, product_type_id, vendor_id, price, sku, compare_price, cost, barcode, weight, inventory_quantity, options, variants, tags, category_id, collections } = validation.value;

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

    const optionsParse = safeParse(options);
    const variantsParse = safeParse(variants);
    const tagsParse = safeParse(tags);
    const collectionsParse = safeParse(collections);

    // CREATE PRODUCT
    const productCode = await generateCode(ProductModels, title);
    const product = await ProductModels.create(
      {
        title,
        description,
        status,
        product_type_id,
        vendor_id,
        category_id,
        sku,
        code: productCode,
      },
      { transaction });

    // UPLOAD MEDIA
    if (req.files && req.files.length > 0) {
      const tenantDbName = req.tenant ? req.tenant.dataBaseName : "default";
      mediaList = buildMediaList(req.files, tenantDbName);
      for (const m of mediaList) {
        await ProductMediaModels.create(
          {
            product_id: product.product_id,
            url: m.url,
            type: m.type,
            position: m.position,
          },
          { transaction },
        );
      }
    }

    // OPTIONS + VALUES
    const optionValueMap = {};
    if (optionsParse.length > 0) {
      for (let i = 0; i < optionsParse.length; i++) {
        const opt = optionsParse[i];
        const optionCode = await generateCode(ProductOptionModels, `${opt.name}-${product.product_id}`);
        const option = await ProductOptionModels.create(
          {
            product_id: product.product_id,
            name: opt.name,
            position: i + 1,
            code: optionCode,
          },
          { transaction },
        );

        if (opt.values && opt.values.length > 0) {
          for (const val of opt.values) {
            if (!val || val.trim() === "") continue;
            const valCode = await generateCode(
              OptionValueModels,
              `${val}-${option.product_option_id}`,
            );
            const optionValue = await OptionValueModels.create(
              {
                product_option_id: option.product_option_id,
                value: val,
                code: valCode,
              },
              { transaction },
            );
            optionValueMap[`${opt.name}:${val}`] = optionValue.option_value_id;
          }
        }
      }
    }

    // COLLECTIONS + VALUES
    for (const collection of collectionsParse) {
      const getCollection = await CollectionModels.findByPk(collection);
      if (!getCollection) continue;
      const collectionCode = await generateCode(CollectionProductModels, `${getCollection.title}-${product.title}`, "code");
      await CollectionProductModels.create(
        {
          product_id: product.product_id,
          collection_id: collection,
          code: collectionCode,
        },
        { transaction },
      );
    }

    // VARIANTS
    const variantsList =
      variantsParse.length > 0
        ? variantsParse
        : [
          {
            title: "Default",
            price: Number(price) || 0,
            sku: sku || null,
            compare_price: compare_price || null,
            cost: cost || null,
            barcode: barcode || null,
            weight: weight || null,
            inventory_quantity: inventory_quantity || 0,
            option_values: [],
          },
        ];

    for (const v of variantsList) {
      const variantCode = await generateCode(ProductVariantModels, `${title}-${v.title}`);
      const variant = await ProductVariantModels.create(
        {
          product_id: product.product_id,
          title: v.title,
          sku: sku || null,
          price: Number(v.price) || 0,
          compare_price: v.compare_price || null,
          cost: v.cost || null,
          barcode: v.barcode || null,
          weight: v.weight || null,
          inventory_quantity: v.inventory_quantity || 0,
          code: variantCode,
        },
        { transaction },
      );
      await InventoryItemModels.create(
        {
          product_id: product.product_id,
          product_variant_id: variant.product_variant_id,
          sku: sku || null,
          available_quantity: v.inventory_quantity || 0,
          code: variantCode,
        },
        { transaction },
      );



      // MAP OPTIONS VALUE
      if (v.option_values && v.option_values.length > 0) {
        for (const ov of v.option_values) {
          const key = `${ov.option}:${ov.value}`;
          if (optionValueMap[key]) {
            await VariantOptionValueModels.create(
              {
                product_variant_id: variant.product_variant_id,
                option_value_id: optionValueMap[key],
              },
              { transaction },
            );
          }
        }
      }
    }

    // TAGS
    if (tagsParse.length > 0) {
      for (const tag of tagsParse) {
        await ProductTagModels.create(
          {
            product_id: product.product_id,
            tag_id: tag,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();
    return res.status(200).send({ success: true, code: 200, message: "Product created successfully", data: product });
  } catch (error) {
    await cleanupFiles(mediaList || req.files);
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE PRODUCT ////////////////////

exports.update_Product = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let mediaList = null;

  try {
    const productId = req.params.id;
    const rawPayload = req.body.data ? JSON.parse(req.body.data) : req.body;
    const validation = validateRequest(createProductSchema, rawPayload);

    if (!validation.isValid) {
      await cleanupFiles(req.files);
      await transaction.rollback();
      return res.status(400).send({ success: false, code: 400, message: validation.message });
    }

    const { title, description, status, product_type_id, vendor_id, sku, options, variants, tags, category_id, collections, existing_images } = validation.value;

    // ---------- SAFE PARSE ----------
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

    const optionsParse = safeParse(options);
    const variantsParse = safeParse(variants);
    const tagsParse = safeParse(tags);
    const collectionsParse = safeParse(collections);
    const existingImagesParse = safeParse(existing_images);

    // ---------- PRODUCT ----------
    const product = await ProductModels.findOne({ where: { product_id: productId }, transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).send({ success: false, code: 404, message: "Product not found" });
    }

    const updatedData = await product.update(
      {
        title,
        description,
        status,
        product_type_id,
        vendor_id,
        category_id,
        sku,
      },
      { transaction },
    );

    // ---------- MEDIA ----------

    if (existingImagesParse?.length > 0) {
      const ids = existingImagesParse.map((img) => img.id);
      await ProductMediaModels.destroy({
        where: {
          product_id: productId,
          product_media_id: { [db.Sequelize.Op.notIn]: ids },
        },
        transaction,
      });
    } else {
      await ProductMediaModels.destroy({ where: { product_id: productId }, transaction });
    }

    if (req.files?.length > 0) {
      const tenantDbName = req.tenant ? req.tenant.dataBaseName : "default";
      mediaList = buildMediaList(req.files, tenantDbName);

      for (const m of mediaList) {
        await ProductMediaModels.create(
          {
            product_id: productId,
            url: m.url,
            type: m.type,
            position: m.position,
          },
          { transaction },
        );
      }
    }

    // ---------- OPTIONS ----------
    const existingOptions = await ProductOptionModels.findAll({
      where: { product_id: productId },
      include: [{ model: OptionValueModels }],
      transaction,
    });

    const existingOptionsMap = new Map();
    existingOptions.forEach((opt) => {
      existingOptionsMap.set(opt.name, opt);
    });

    const optionValueMap = {};
    for (let i = 0; i < optionsParse.length; i++) {
      const opt = optionsParse[i];
      let option = existingOptionsMap.get(opt.name);

      if (option) {
        await option.update({ position: i + 1 }, { transaction });
        const existingValues = await OptionValueModels.findAll({
          where: { product_option_id: option.product_option_id },
          transaction,
        });

        const map = new Map();
        existingValues.forEach((v) => map.set(v.value, v));

        for (const val of opt.values) {
          if (!val?.trim()) continue;
          let ov = map.get(val);
          if (!ov) {
            const code = await generateCode(OptionValueModels, `${val}-${option.product_option_id}`);
            ov = await OptionValueModels.create(
              {
                product_option_id: option.product_option_id,
                value: val,
                code,
              },
              { transaction },
            );
          }

          optionValueMap[`${opt.name}:${val}`] = ov.option_value_id;
          map.delete(val);
        }

        // delete removed
        for (const [, v] of map) {
          await VariantOptionValueModels.destroy({
            where: { option_value_id: v.option_value_id },
            transaction,
          });
          await v.destroy({ transaction });
        }
      } else {
        const code = await generateCode(
          ProductOptionModels,
          `${opt.name}-${productId}`,
        );

        option = await ProductOptionModels.create(
          {
            product_id: productId,
            name: opt.name,
            position: i + 1,
            code,
          },
          { transaction },
        );

        for (const val of opt.values) {
          if (!val?.trim()) continue;

          const valCode = await generateCode(
            OptionValueModels,
            `${val}-${option.product_option_id}`,
          );

          const ov = await OptionValueModels.create(
            {
              product_option_id: option.product_option_id,
              value: val,
              code: valCode,
            },
            { transaction },
          );

          optionValueMap[`${opt.name}:${val}`] = ov.option_value_id;
        }
      }
    }

    // ---------- VARIANTS ----------
    const existingVariants = await ProductVariantModels.findAll({
      where: { product_id: productId },
      transaction,
    });

    const existingVariantsMap = new Map();
    existingVariants.forEach((v) => {
      existingVariantsMap.set(v.title, v);
    });

    // helper
    const getOptionValueId = async (ov) => {
      if (ov.option_value_id) return ov.option_value_id;

      let optionName = ov.option;

      // if UUID → resolve
      if (optionName?.includes("-")) {
        const opt = await ProductOptionModels.findByPk(optionName);
        if (opt) optionName = opt.name;
      }

      return optionValueMap[`${optionName}:${ov.value}`] || null;
    };

    const processed = new Set();

    for (const v of variantsParse) {
      processed.add(v.title);

      let variant = existingVariantsMap.get(v.title);

      const payload = {
        sku: sku || v.sku,
        price: Number(v.price) || 0,
        compare_price: v.compare_price || null,
        cost: v.cost || null,
        barcode: v.barcode || null,
        weight: v.weight || null,
        inventory_quantity: Number(v.inventory_quantity) || 0,
        isActive: v.isActive !== false,
      };

      if (variant) {
        await variant.update(payload, { transaction });

        await VariantOptionValueModels.destroy({
          where: { product_variant_id: variant.product_variant_id },
          transaction,
        });
      } else {
        const code = await generateCode(
          ProductVariantModels,
          `${title}-${v.title}`,
        );

        variant = await ProductVariantModels.create(
          {
            product_id: productId,
            title: v.title,
            code,
            ...payload,
          },
          { transaction },
        );
      }

      // attach option values
      for (const ov of v.option_values || []) {
        const optionValueId = await getOptionValueId(ov);

        if (!optionValueId) continue;

        await VariantOptionValueModels.create(
          {
            product_variant_id: variant.product_variant_id,
            option_value_id: optionValueId,
          },
          { transaction },
        );
      }
    }

    // delete removed variants
    for (const [title, variant] of existingVariantsMap) {
      if (!processed.has(title)) {
        await VariantOptionValueModels.destroy({
          where: { product_variant_id: variant.product_variant_id },
          transaction,
        });
        await variant.destroy({ transaction });
      }
    }

    // ---------- TAGS ----------
    await ProductTagModels.destroy({
      where: { product_id: productId },
      transaction,
    });

    for (const tag of tagsParse) {
      await ProductTagModels.create(
        {
          product_id: productId,
          tag_id: tag,
        },
        { transaction },
      );
    }

    // ---------- COLLECTIONS ----------
    await CollectionProductModels.destroy({
      where: { product_id: productId },
      transaction,
    });

    for (const col of collectionsParse) {
      const collection = await CollectionModels.findByPk(col);
      if (!collection) continue;

      const code = await generateCode(
        CollectionProductModels,
        `${collection.title}-${title}`,
      );

      await CollectionProductModels.create(
        {
          product_id: productId,
          collection_id: col,
          code,
        },
        { transaction },
      );
    }

    await transaction.commit();
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Product Updated Successfully",
      data: updatedData,
    });
  } catch (error) {
    await cleanupFiles(mediaList || req.files);
    await transaction.rollback();

    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE STATUS PRODUCT ////////////////////

exports.update_Status_Product = async (req, res) => {
  try {
    const productId = req.params.id;
    const { status } = req.body;
    const product = await ProductModels.findOne({ where: { product_id: productId } });
    if (!product) {
      return res.status(404).send({ success: false, code: 404, message: "Product not found" });
    }
    await product.update({ status: status === "DRAFT" ? "PUBLISHED" : "DRAFT" });
    return res.status(200).send({ success: true, code: 200, message: "Product status updated successfully", data: product });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL PRODUCT ////////////////////

exports.get_All_Product = async (req, res) => {
  try {

    const { page = 1, limit = 10, search = "", statusBy = "" } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition = { isDeleted: 0 };

    if (search) {
      whereCondition.title = {
        [Op.like]: `%${search}%`,
      };
    }
    if (statusBy !== "") {
      whereCondition.status = statusBy;
    }

    const { count, rows } = await ProductModels.findAndCountAll({
      where: whereCondition,
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
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetch All Product Data Successfully",
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET BYID PRODUCT ////////////////////

exports.get_ById_Product = async (req, res) => {
  try {
    const productId = req.params.id;
    const getData = await ProductModels.findOne({
      where: {
        isDeleted: 0,
        [Op.or]: [{ product_id: productId }, { code: productId }],
      },
      include: [
        {
          model: ProductMediaModels,
          as: "media",
          order: [["position", "ASC"]],
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
      order: [
        [
          {
            model: ProductOptionModels,
            as: "options"
          },
          "position", "ASC"],
        [
          {
            model: ProductOptionModels,
            as: "options"
          },
          {
            model: OptionValueModels,
            as: "OptionValues"
          },
          "order_by",
          "ASC",
        ],
        [
          {
            model: ProductVariantModels,
            as: "variants"
          }, "order_by", "ASC"],
      ],
    });

    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Product not found" });
    }

    if (getData.options) {
      getData.options.sort((a, b) => a.position - b.position);
      getData.options.forEach((option) => {
        if (option.OptionValues) {
          option.OptionValues.sort((a, b) => a.order_by - b.order_by);
        }
      });
    }

    if (getData.variants) {
      getData.variants.sort((a, b) => a.order_by - b.order_by);
    }

    return res.status(200).send({ success: true, code: 200, message: "Fetch Product Data Successfully", data: getData });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL FILTERED PRODUCT ////////////////////

exports.get_All_filtered_Product = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const { conditions = [], condition_apply_type = "all" } = req.body;

    const whereCondition = { isDeleted: false };

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    const dynamicWhere = buildWhereClause(conditions, condition_apply_type);

    // Check what filters are present
    const hasTagFilter = conditions.some((c) => c.title === "tag");
    const hasCategoryFilter = conditions.some((c) => c.title === "category");
    const hasVendorFilter = conditions.some((c) => c.title === "vendor");
    const hasTypeFilter = conditions.some((c) => c.title === "type");
    const hasVariantFilter = conditions.some((c) =>
      ["price", "inventory_stock"].includes(c.title),
    );

    const queryOptions = {
      where: {
        ...whereCondition,
        ...dynamicWhere,
      },
      include: [
        {
          model: ProductMediaModels,
          as: "media",
          required: false,
        },
        {
          model: ProductVariantModels,
          as: "variants",
          required: hasVariantFilter,
          include: [
            {
              model: OptionValueModels,
              as: "optionValues",
              required: false,
            },
          ],
        },
        {
          model: ProductOptionModels,
          as: "options",
          required: false,
          include: [
            {
              model: OptionValueModels,
              required: false,
            },
          ],
        },
        {
          model: ProductTagModels,
          as: "tags",
          required: hasTagFilter && condition_apply_type !== "all",
          duplicating: false,
          include: [
            {
              model: TagModels,
              as: "tag",
              required: false,
            },
          ],
        },
        {
          model: CategoryModels,
          as: "category",
          required: hasCategoryFilter,
        },
        {
          model: VendorModels,
          as: "vendors",
          required: hasVendorFilter,
        },
        {
          model: ProductTypeModels,
          as: "product_types",
          required: hasTypeFilter,
        },
        {
          model: CollectionProductModels,
          as: "collectionProducts",
          required: false,
          include: [
            {
              model: CollectionModels,
              as: "collection",
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      subQuery: false,
    };

    const { count, rows } = await ProductModels.findAndCountAll(queryOptions);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetch Filtered Products Successfully",
      total: count,
      data: rows,
      debug: {
        conditions_received: conditions.length,
        apply_type: condition_apply_type,
        has_tag_filter: hasTagFilter,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// DELETE PRODUCT ////////////////////

exports.delete_Product = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const productId = req.params.id;
    const product = await ProductModels.findOne({
      where: { product_id: productId, isDeleted: 0 },
      transaction,
    });

    if (!product) {
      await transaction.rollback();
      return res
        .status(404)
        .send({ success: false, code: 404, message: "Product not found" });
    }

    await product.update({ isDeleted: 1 }, { transaction });
    await transaction.commit();
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Product deleted (inactive) successfully",
    });
  } catch (error) {
    await transaction.rollback();
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
