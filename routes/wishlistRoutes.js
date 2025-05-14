const express = require("express");
const isAuth = require("../middlewares/isAuth");
const wishlistController = require("../controllers/wishlistController");
const wishlistRouter = express.Router();

wishlistRouter.delete("/remove/:id",isAuth, wishlistController.removeFromWishlist);
wishlistRouter.get("/view", isAuth,wishlistController.getWishlist);
wishlistRouter.post("/add/:id", isAuth,wishlistController.addToWishlist);

module.exports = wishlistRouter;