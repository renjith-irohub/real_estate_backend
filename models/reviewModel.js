const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      // Reviewer: always the customer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    reviewedUser: {
      // Reviewed person: agent or owner
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
