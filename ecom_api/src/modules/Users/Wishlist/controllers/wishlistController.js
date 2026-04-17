const db = require("../../../../indexRoutes/index");
const WishlistModels = db.WishlistModels;
const ProductModels = db.Product;
const ProductVariantModels = db.ProductVariant;
const { handleDatabaseError } = require("../../../../utils/errorHandler");

//////////////////// ADD TO WISHLIST ////////////////////

exports.add_To_Wishlist = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const userId = req.user.user_id;
        const { productId, productVariantId = null } = req.body;

        if (!productId) {
            await transaction.rollback();
            return res.status(400).send({ success: false, code: 400, message: "productId is required" });
        }

        const product = await ProductModels.findOne({ where: { product_id: productId, isActive: true }, transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).send({ success: false, code: 404, message: "Product not found" });
        }

        if (productVariantId) {
            const variant = await ProductVariantModels.findOne({
                where: {
                    product_variant_id: productVariantId,
                    product_id: productId
                },
                transaction,
            });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).send({ success: false, code: 404, message: "Variant not found" });
            }
        }

        const existingItem = await WishlistModels.findOne({
            where: {
                user_id: userId,
                product_id: productId,
                product_variant_id: productVariantId || null,
            },
            transaction,
        });

        if (existingItem) {
            await transaction.rollback();
            return res.status(200).send({ success: true, code: 200, message: "Item is already in wishlist", data: existingItem });
        }

        const newItem = await WishlistModels.create(
            {
                user_id: userId,
                product_id: productId,
                product_variant_id: productVariantId || null,
            },
            { transaction }
        );

        await transaction.commit();
        return res.status(200).send({ success: true, code: 200, message: "Item added to wishlist successfully", data: newItem });
    } catch (error) {
        await transaction.rollback();
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};

//////////////////// REMOVE FROM WISHLIST ////////////////////

exports.remove_From_Wishlist = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const userId = req.user.user_id;
        const wishlistId = req.params.id;

        const item = await WishlistModels.findOne({ where: { wishlist_id: wishlistId, user_id: userId }, transaction });
        if (!item) {
            await transaction.rollback();
            return res.status(404).send({ success: false, code: 404, message: "Wishlist item not found" });
        }

        await item.destroy({ transaction });

        await transaction.commit();
        return res.status(200).send({ success: true, code: 200, message: "Item removed from wishlist successfully" });
    } catch (error) {
        await transaction.rollback();
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};

//////////////////// GET WISHLIST ////////////////////

exports.get_Wishlist = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const items = await WishlistModels.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: ProductModels,
                    as: "product",
                },
                {
                    model: ProductVariantModels,
                    as: "variant",
                },
            ],
            order: [["wishlist_id", "DESC"]],
        });

        if (!items || items.length === 0) {
            return res.status(200).send({ success: true, code: 200, message: "Wishlist is empty", data: [] });
        }

        return res.status(200).send({ success: true, code: 200, message: "Wishlist fetched successfully", data: items });
    } catch (error) {
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};

//////////////////// CLEAR WISHLIST ////////////////////

exports.clear_Wishlist = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const userId = req.user.user_id;

        await WishlistModels.destroy({ where: { user_id: userId }, transaction });

        await transaction.commit();
        return res.status(200).send({ success: true, code: 200, message: "Wishlist cleared successfully" });
    } catch (error) {
        await transaction.rollback();
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};
