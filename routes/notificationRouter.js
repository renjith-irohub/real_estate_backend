const express = require("express");
const isAuth = require("../middlewares/isAuth");
const notificationController = require("../controllers/notificationController");
const notificationRouter = express.Router();

notificationRouter.get("/viewall",isAuth,notificationController.getUserNotifications);
notificationRouter.put("/update",isAuth,notificationController.markNotificationAsRead);
notificationRouter.delete("/delete/:id", isAuth, notificationController.deleteNotification);
notificationRouter.delete("/deleteall", isAuth, notificationController.deleteAllNotifications);

module.exports = notificationRouter;
