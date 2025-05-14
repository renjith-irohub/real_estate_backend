const express = require("express");
const adminRouter = express.Router();
const isAuth = require("../middlewares/isAuth");
const adminController = require("../controllers/adminController");

// Example: GET /admin/users
adminRouter.get("/users",isAuth, adminController.getAllUsers);
adminRouter.get("/user/:id", isAuth, adminController.getUserById);
adminRouter.delete("/deleteuser/:id",isAuth, adminController.deleteUserById);
adminRouter.patch("/user/:id/verify",isAuth, adminController.verifyUser);
adminRouter.get("/payments",isAuth, adminController.getAllPayments);
adminRouter.get("/counts",isAuth, adminController.getDashboardCounts);

module.exports = adminRouter;
