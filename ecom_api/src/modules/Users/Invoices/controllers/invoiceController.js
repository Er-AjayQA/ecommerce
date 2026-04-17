const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const { renderInvoiceHtml } = require("../../../../services/invoice.service");

const InvoiceModels = db.InvoiceModels;
const OrderModels = db.OrderModels;

exports.get_Order_Invoice = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderId = req.params.orderId;

    const order = await OrderModels.findOne({ where: { order_id: orderId, user_id: userId } });

    if (!order) {
      return res.status(404).send({ success: false, code: 404, message: "Order not found" });
    }

    const invoice = await InvoiceModels.findOne({ where: { order_id: orderId } });
    if (!invoice) {
      return res.status(404).send({ success: false, code: 404, message: "Invoice not found" });
    }

    if (String(req.query.format || "").toLowerCase() === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(renderInvoiceHtml(invoice, order));
    }

    return res.status(200).send({ success: true, code: 200, message: "Invoice fetched successfully", data: invoice });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
