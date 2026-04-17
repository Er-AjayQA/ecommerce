const orderController = require("../controllers/orderController");
const validate = require("../../../../middleware/validate");
const { OrderDTO } = require("../../../../dto/order.dto");
const { UpdateOrderStatusDTO, CreateTrackingEventDTO } = require("../../../../dto/orderTracking.dto");

module.exports = (app) => {
    app.post("/api/v1/place_Order", validate(OrderDTO), orderController.place_Order);
    app.post("/api/v1/orders", validate(OrderDTO), orderController.place_Order);
    app.get("/api/v1/get_All_User_Orders", orderController.get_All_User_Orders);
    app.get("/api/v1/orders", orderController.get_All_User_Orders);
    app.get("/api/v1/orders/:id", orderController.get_Order_By_Id);
    app.get("/api/v1/orders/:id/tracking", orderController.get_Order_Tracking);
    app.post("/api/v1/orders/:id/tracking-events", validate(CreateTrackingEventDTO), orderController.create_Order_Tracking_Event);
    app.put("/api/v1/update_Order_Status/:id", validate(UpdateOrderStatusDTO), orderController.update_Order_Status);
    app.patch("/api/v1/orders/:id/status", validate(UpdateOrderStatusDTO), orderController.update_Order_Status);
};
