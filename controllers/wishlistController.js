const User = require("../models/userModel");
const PropertyModel = require("../models/propertyModel"); // ✅ Renamed to avoid conflict
const asyncHandler = require("express-async-handler");

const wishlistController = {
  // Add Property to Wishlist
  addToWishlist: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const property = await PropertyModel.findById(id); // ✅ use PropertyModel

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if already in wishlist
    if (user.wishlist.includes(id)) {
      return res.status(200).json({ message: "Property already in wishlist" });
    }

    user.wishlist.push(id);
    await user.save();

    res.status(200).json({ message: "Property added to wishlist", wishlist: user.wishlist });
  }),

  // Remove from Wishlist
  removeFromWishlist: asyncHandler(async (req, res) => {
    const { id: propertyId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    res.status(200).json({ message: "Property removed from wishlist", wishlist: user.wishlist });
  }),

  // Get Wishlist
  getWishlist: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist });
  }),
};

module.exports = wishlistController;
