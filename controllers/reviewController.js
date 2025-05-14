const Review = require("../models/reviewModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const asyncHandler = require("express-async-handler");

const reviewController = {
  addReview: asyncHandler(async (req, res) => {
    const { propertyId,  rating, comment } = req.body;
    const userId = req.user?.id; // Use the authenticated user ID from middleware

    // Log incoming data for debugging
    console.log("Request Body:", req.body);
    console.log("Authenticated User:", req.user);

    // Validate required fields (excluding userId from body)
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ message: "Property ID, rating, and comment are required." });
    }
    if (!userId) {
      return res.status(401).json({ message: "User authentication failed." });
    }

    // Convert propertyId to ObjectId (ensure it matches the schema)
    const propertyObjectId = new mongoose.Types.ObjectId(propertyId);

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      user: userId,
      property: propertyObjectId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this property." });
    }

    // Create and save review
    const review = new Review({
      user: userId, // Should be a valid ObjectId from req.user._id
      property: propertyObjectId,
      rating: Number(rating), // Ensure rating is a number
      comment,
    });

    await review.save();

    // Notify property owner
    const property = await Property.findById(propertyId);
    if (property) {
      await Notification.create({
        user: property.owner || property.agent,
        message: `📝 New Review: A new review was posted for your property ${property.title}.`,
      });

      await updateAverageRating(Property, propertyId, "property");
    }

    res.status(201).json({ message: "Review added successfully.", review });
  }),

  createUserReview: asyncHandler(async (req, res) => {
    const customerId = req.user?.id;
    const { userId } = req.params; // ID of the agent/owner being reviewed
    const { rating, comment } = req.body;
  
    console.log("Reviewing User ID:", userId);
    console.log("Authenticated User:", req.user);
    console.log("BODY:", req.body); // Check if rating/comment are undefined

  
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }
  
    if (!customerId) {
      return res.status(401).json({ message: "User authentication failed." });
    }
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
  
    // Check if user exists and is reviewable (agent or owner)
    const reviewedUser = await User.findById(userId);
    if (!reviewedUser || !["agent", "owner"].includes(reviewedUser.role)) {
      return res.status(404).json({ message: "User not found or not eligible for reviews." });
    }
  
    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      user: customerId,
      reviewedUser: userId,
    });
  
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this user." });
    }
  
    // Create and save review
    const review = await Review.create({
      user: customerId,
      reviewedUser: userId,
      rating: Number(rating),
      comment,
    });
  
    // Notify the reviewed user (agent/owner)
    await Notification.create({
      user: userId,
      message: ` ⭐ New Review: Someone reviewed your profile and gave you ${review.rating} star. `,
    });
  
    await updateAverageRating(User, userId, "reviewedUser");
  
    res.status(201).json({ message: "Review added successfully.", review });
  }),
  
  getReviews: asyncHandler(async (req, res) => {
    const { propertyId, agentId } = req.query;
  
    const filter = {};
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ message: "Invalid propertyId" });
      }
      filter.property = new mongoose.Types.ObjectId(propertyId);
    }
  
    if (agentId) {
      if (!mongoose.Types.ObjectId.isValid(agentId)) {
        return res.status(400).json({ message: "Invalid agentId" });
      }
      filter.agent = new mongoose.Types.ObjectId(agentId);
    }
  
    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });
  
    res.status(200).send(reviews);
  }),

  deleteReview: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Check if the review exists
    const review = await Review.findById(id);
  
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
  
    // Check if the logged-in user is the author of the review
    if (!review.user || review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this review." });
    }
  
    // Proceed with review deletion
    await review.deleteOne();
  
    const propertyId = review.property;
    const reviewedUserId = review.reviewedUser;
  
    // Update average rating for property and reviewed user
    if (propertyId) {
      await updateAverageRating(Property, propertyId, "property");
    }
    if (reviewedUserId) {
      await updateAverageRating(User, reviewedUserId, "reviewedUser");
    }
  
    res.status(200).json({ message: "Review deleted successfully." });
  }),
  
};  




const updateAverageRating = async (Model, id, type) => {
  const reviews = await Review.find({ [type]: id });

  const avgRating = reviews.length
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  await Review.updateMany({ [type]: id }, { averageRating: avgRating });
  await Model.findByIdAndUpdate(id, { averageRating: avgRating });
};



const mongoose = require("mongoose"); // Add this at the top if not already included
module.exports = reviewController;
