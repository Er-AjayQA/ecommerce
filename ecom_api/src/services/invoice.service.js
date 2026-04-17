const db = require("../indexRoutes/index");
const generateCode = require("../utils/generateCode");

const InvoiceModels = db.InvoiceModels;

const pickAddressSnapshot = (address) => {
  if (!address) return null;

  return {
    first_name: address.first_name || null,
    last_name: address.last_name || null,
    phone_number: address.phone_number || null,
    address_line_1: address.address_line_1 || null,
    address_line_2: address.address_line_2 || null,
    city: address.city || null,
    state: address.state || null,
    country: address.country || null,
    postal_code: address.postal_code || null,
  };
};

const createInvoiceForOrder = async ({ order, orderItems, billingAddress, shippingAddress, transaction }) => {
  const invoiceNumber = await generateCode(InvoiceModels, `inv-${order.code}`, "invoice_number");
  return InvoiceModels.create(
    {
      order_id: order.order_id,
      user_id: order.user_id,
      invoice_number: invoiceNumber.toUpperCase(),
      invoice_date: new Date(),
      due_date: new Date(),
      sub_total: order.sub_total,
      tax_amount: order.tax_amount,
      shipping_amount: order.shipping_amount,
      discount_amount: order.discount_amount,
      grand_total: order.grand_total,
      billing_snapshot: pickAddressSnapshot(billingAddress),
      shipping_snapshot: pickAddressSnapshot(shippingAddress),
      line_items_snapshot: orderItems.map((item) => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      })),
      status: "GENERATED",
    },
    { transaction }
  );
};

const renderInvoiceHtml = (invoice, order) => {
  const items = Array.isArray(invoice.line_items_snapshot) ? invoice.line_items_snapshot : [];
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.product_id}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${item.line_total}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
    h1, h2, p { margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
    .totals { margin-top: 24px; width: 320px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Invoice ${invoice.invoice_number}</h1>
  <p>Order: ${order.code}</p>
  <p>Date: ${new Date(invoice.invoice_date).toISOString()}</p>
  <h2>Items</h2>
  <table>
    <thead>
      <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${invoice.sub_total}</span></div>
    <div><span>Discount</span><span>${invoice.discount_amount}</span></div>
    <div><span>Tax</span><span>${invoice.tax_amount}</span></div>
    <div><span>Shipping</span><span>${invoice.shipping_amount}</span></div>
    <div><strong>Grand Total</strong><strong>${invoice.grand_total}</strong></div>
  </div>
</body>
</html>`;
};

module.exports = {
  createInvoiceForOrder,
  renderInvoiceHtml,
};
