const express = require("express");
const isAuth = require("../middlewares/isAuth");
const chartController = require("../controllers/chartController");
const chartRouter = require("express").Router();
const { upload } = require("../middlewares/cloudinary");

chartRouter.get("/usercounts", isAuth, chartController.getUserRoleCounts);
chartRouter.get("/propertytypes", isAuth, chartController.getPropertyTypeCounts);
chartRouter.get("/citywise", isAuth, chartController.getCityWiseChart);
chartRouter.get("/pricewise", isAuth, chartController.getSubscriptionChart);
chartRouter.get("/reports", isAuth, chartController.getPaymentReport);

module.exports = chartRouter;