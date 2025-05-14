const express = require("express");
const isAuth = require("../middlewares/isAuth");
const paymentController = require("../controllers/paymentController");

const paymentRouter = express.Router();

paymentRouter.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);
paymentRouter.post("/checkout",express.json(), isAuth, paymentController.processPayment);
paymentRouter.put("/update",express.json(), isAuth, paymentController.updatePaymentStatus);
paymentRouter.get("/all",express.json(), isAuth, paymentController.getPayments);

paymentRouter.get("/getlimit",express.json(), isAuth, paymentController.getPropertyLimit);
paymentRouter.get("/:id",express.json(), isAuth, paymentController.getPaymentById);

module.exports = paymentRouter;
