const { Op, fn, col, literal } = require("sequelize");
const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");

const OrderModels = db.OrderModels;
const OrderItemModels = db.OrderItemModels;
const CouponUsageModels = db.CouponUsageModels;
const NotificationModels = db.NotificationModels;
const ProductModels = db.Product;

const getDateRange = (query) => {
  const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = query.endDate ? new Date(query.endDate) : new Date();
  return { start, end };
};

exports.get_Dashboard_Analytics = async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const where = {
      createdAt: {
        [Op.between]: [start, end],
      },
      isDeleted: false,
    };

    const [totals, statusBreakdown, topProducts, couponStats, notificationStats] = await Promise.all([
      OrderModels.findAll({
        where,
        attributes: [
          [fn("COUNT", col("order_id")), "totalOrders"],
          [fn("SUM", col("grand_total")), "grossRevenue"],
          [fn("SUM", col("discount_amount")), "totalDiscount"],
        ],
        raw: true,
      }),
      OrderModels.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("order_id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      OrderItemModels.findAll({
        attributes: [
          "product_id",
          [fn("SUM", col("quantity")), "unitsSold"],
          [fn("SUM", col("line_total")), "salesAmount"],
        ],
        include: [{ model: ProductModels, as: "product", attributes: ["title"], required: false }],
        group: ["product_id", "product.product_id"],
        order: [[literal("unitsSold"), "DESC"]],
        limit: 5,
      }),
      CouponUsageModels.findAll({
        attributes: [
          "coupon_code",
          [fn("COUNT", col("coupon_usage_id")), "totalUses"],
          [fn("SUM", col("discount_amount")), "totalDiscountGiven"],
        ],
        group: ["coupon_code"],
        order: [[literal("totalUses"), "DESC"]],
        raw: true,
      }),
      NotificationModels.findAll({
        attributes: ["channel", "status", [fn("COUNT", col("notification_id")), "count"]],
        group: ["channel", "status"],
        raw: true,
      }),
    ]);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Analytics fetched successfully",
      data: {
        range: { startDate: start, endDate: end },
        totals: totals[0] || {},
        statusBreakdown,
        topProducts,
        couponStats,
        notificationStats,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_Sales_Report = async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const orders = await OrderModels.findAll({
      where: {
        createdAt: { [Op.between]: [start, end] },
        isDeleted: false,
      },
      include: [
        {
          model: OrderItemModels,
          as: "order_items",
          include: [{ model: ProductModels, as: "product", attributes: ["title"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Sales report fetched successfully", data: orders });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
