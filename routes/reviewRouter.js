const express = require("express");
const isAuth = require("../middlewares/isAuth");
const reviewController = require("../controllers/reviewController");
const reviewRouter = express.Router();

reviewRouter.get("/viewall", isAuth,reviewController.getReviews);
reviewRouter.post("/add", isAuth,reviewController.addReview);// ✅ Accept userId in URL
reviewRouter.post("/addreview/:userId", isAuth, reviewController.createUserReview);

reviewRouter.delete("/delete/:id",isAuth, reviewController.deleteReview);

module.exports = reviewRouter;