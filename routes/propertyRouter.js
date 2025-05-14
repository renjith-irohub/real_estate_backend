const express = require("express");
const propertyController = require("../controllers/propertyController");
const { upload, uploadVideos } = require("../middlewares/cloudinary");
const isAuth = require("../middlewares/isAuth");

const propertyRouter = express.Router();

// 🗑️ Delete property
propertyRouter.delete("/delete/:id", isAuth, propertyController.deleteProperty);

// 📥 Get all properties
propertyRouter.get("/getall", isAuth, propertyController.getAllProperties);
propertyRouter.get("/view/:id", isAuth, propertyController.getSingleProperty);
// 🆕 Add property (Images + Videos)
propertyRouter.post(
  "/add",
  isAuth,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  propertyController.createProperty
);

// 🔍 Search properties
propertyRouter.post("/search", isAuth, propertyController.searchProperties);

propertyRouter.put(
  "/edit/:id",
  isAuth,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  propertyController.updateProperty
);
// 👁️ View single property
propertyRouter.get("/viewall/:id", isAuth, propertyController.showProperty);


propertyRouter.get("/getproperty", isAuth, propertyController.getProperties);


propertyRouter.get("/getbyid/:id", isAuth, propertyController.getPropertyById);

propertyRouter.get("/profile/:userId", isAuth, propertyController.getProfileByUserId);

propertyRouter.get("/featured", isAuth, propertyController.getFeaturedProperties);

propertyRouter.get("/goodreviews", isAuth, propertyController.getGoodReviews);

module.exports = propertyRouter;
