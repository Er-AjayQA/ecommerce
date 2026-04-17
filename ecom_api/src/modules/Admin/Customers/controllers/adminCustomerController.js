const { Op, fn, col } = require("sequelize");
const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");

const UserModels = db.UserModels;
const AddressModels = db.AddressModels;
const OrderModels = db.OrderModels;
const WishlistModels = db.WishlistModels;
const CartModels = db.CartModels;

exports.get_All_Admin_Customers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = { isDeleted: false };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email_id: { [Op.like]: `%${search}%` } },
        { mobile_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const customers = await UserModels.findAll({
      where,
      attributes: ["user_id", "name", "email_id", "mobile_number", "status", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const customerIds = customers.map((customer) => customer.user_id);
    const orderStats = customerIds.length
      ? await OrderModels.findAll({
          where: { user_id: { [Op.in]: customerIds }, isDeleted: false },
          attributes: [
            "user_id",
            [fn("COUNT", col("order_id")), "totalOrders"],
            [fn("SUM", col("grand_total")), "totalSpend"],
            [fn("MAX", col("createdAt")), "lastOrderAt"],
          ],
          group: ["user_id"],
          raw: true,
        })
      : [];

    const orderMap = new Map(orderStats.map((item) => [item.user_id, item]));
    const response = customers.map((customer) => ({
      ...customer,
      stats: {
        totalOrders: Number(orderMap.get(customer.user_id)?.totalOrders || 0),
        totalSpend: Number(orderMap.get(customer.user_id)?.totalSpend || 0),
        lastOrderAt: orderMap.get(customer.user_id)?.lastOrderAt || null,
      },
    }));

    return res.status(200).send({ success: true, code: 200, message: "Admin customers fetched successfully", data: response });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_Admin_Customer_By_Id = async (req, res) => {
  try {
    const customer = await UserModels.findOne({
      where: { user_id: req.params.id, isDeleted: false },
      attributes: { exclude: ["password", "otp", "otp_expiry"] },
    });

    if (!customer) {
      return res.status(404).send({ success: false, code: 404, message: "Customer not found" });
    }

    const [addresses, orders, wishlistCount, activeCart] = await Promise.all([
      AddressModels.findAll({
        where: { user_id: customer.user_id, isDeleted: false },
        order: [["createdAt", "DESC"]],
      }),
      OrderModels.findAll({
        where: { user_id: customer.user_id, isDeleted: false },
        order: [["createdAt", "DESC"]],
      }),
      WishlistModels.count({ where: { user_id: customer.user_id } }),
      CartModels.findOne({ where: { user_id: customer.user_id, status: "ACTIVE" } }),
    ]);

    const totalSpend = orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Admin customer fetched successfully",
      data: {
        customer,
        addresses,
        orders,
        stats: {
          totalOrders: orders.length,
          totalSpend,
          wishlistCount,
          activeCartTotal: Number(activeCart?.grand_total || 0),
          activeCartItems: Number(activeCart?.total_items || 0),
        },
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.update_Admin_Customer_Status = async (req, res) => {
  try {
    const customer = await UserModels.findOne({ where: { user_id: req.params.id, isDeleted: false } });
    if (!customer) {
      return res.status(404).send({ success: false, code: 404, message: "Customer not found" });
    }

    const body = req.validatedBody || req.body;
    await customer.update({
      status: body.status,
      isActive: typeof body.isActive === "boolean" ? body.isActive : body.status === "ACTIVE",
    });

    return res.status(200).send({ success: true, code: 200, message: "Customer status updated successfully", data: customer });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
