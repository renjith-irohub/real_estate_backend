const express = require("express");
const isAuth = require("../middlewares/isAuth");
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/cloudinary");

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.put("/profileedit", isAuth, upload.single("image"), userController.profile); // 👈 field name = "image"
userRouter.delete("/logout", userController.logout);
userRouter.get("/view", isAuth, userController.getUserProfile);
userRouter.post("/forgot", userController.forgotPassword);
userRouter.post("/reset", userController.resetPassword);
userRouter.post("/changePassword", isAuth, userController.changePassword);

module.exports = userRouter;
