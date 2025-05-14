const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["home", "land", "both", "flat", "commercial"],
      required: true,
    },
    location: { type: String, required: true },
    district: { type: String, required: true },
    price: { type: Number, required: true },
    propertyFor: {
      type: String,
      enum: ["rent", "buy"],
      required: true,
    },
    bedrooms: {
      type: Number,
      required: function () {
        return ["home", "flat", "both"].includes(this.propertyType);
      },
    },
    bathrooms: {
      type: Number,
      required: function () {
        return ["home", "flat", "both"].includes(this.propertyType);
      },
    },
    kitchens: {
      type: Number,
      required: function () {
        return ["home", "flat", "both"].includes(this.propertyType);
      },
    },
    area: { type: Number, required: true },
    features: { type: String },
    photos: [{ type: String }],
    videos: [{ type: String }],
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    parkingSpot: { type: Boolean, default: false },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
averageRating: {
  type: Number,
  default: 0,
},

  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;