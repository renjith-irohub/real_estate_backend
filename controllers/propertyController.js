const Agent = require("../models/agentModel");
const Property = require("../models/propertyModel");
const Payment = require("../models/paymentModel");
const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const propertyController = {
  createProperty: asyncHandler(async (req, res) => {
    const userId = req.user.id; // User ID from auth middleware
    const user=await User.findById(userId)
    const userRole = user.role; // User role (e.g., "agent" or "owner")
console.log(req.user)
    // Prepare property data from request body
    let propertyData = { ...req.body };

    // Handle file uploads (photos and videos)
    const photos = req.files.photos ? req.files.photos.map((file) => file.path) : [];
    const videos = req.files.videos ? req.files.videos.map((file) => file.path) : [];

    // Role-based logic
    if (userRole === "agent") {
      // Agent-specific logic
      
      // Count existing properties for this agent
      const agentProperties = await Property.countDocuments({ agentId: userId });

      // Check subscription and set property limit
      const activeSubscription = await Payment.findOne({ agentId: userId, status: "active" });
      let propertyLimit = 5; // Default limit for agents
      if (activeSubscription) {
        switch (activeSubscription.plan) {
          case "basic":
            propertyLimit = 10;
            break;
          case "premium":
            propertyLimit = 15;
            break;
          case "vip":
            propertyLimit = 25;
            break;
          default:
            propertyLimit = 5; // Fallback for unrecognized plans
        }
      }

      // Enforce property limit for agents
      if (agentProperties >= propertyLimit) {
        return res.status(403).json({
          message: `You have reached your property limit (${propertyLimit}). Please upgrade your subscription.`,
        });
      }

      // Assign agentId for agent-created properties
      propertyData.agentId = userId;
    } else if (userRole === "owner") {
      // Owner-specific logic
      // Count existing properties for this owner
      const ownerProperties = await Property.countDocuments({ ownerId: userId });
      
      // Check subscription and set property limit
      const activeSubscription = await Payment.findOne({ ownerId: userId});
console.log("Active Subscription:", activeSubscription);

      let propertyLimit = activeSubscription?.propertyLimit || 5; // Default limit for owners
      
      // Enforce property limit for owners
      if (ownerProperties >= propertyLimit) {
        return res.status(403).json({
          message: `You have reached your property limit (${propertyLimit}). Please upgrade your subscription.`,
        });
      }

      // Assign ownerId for owner-created properties
      propertyData.ownerId = userId;
    } else {
      // Invalid role handling
      return res.status(403).json({ message: "Invalid user role. Must be 'agent' or 'owner'." });
    }

    // Add uploaded files to property data
    propertyData.photos = photos.length > 0 ? photos : undefined; // Only set if photos exist
    propertyData.videos = videos.length > 0 ? videos : undefined; // Only set if videos exist

    // Create and save the new property
    try {
      const newProperty = new Property(propertyData);
      const savedProperty = await newProperty.save();
      res.status(201).json(savedProperty);
    } catch (error) {
      return res.status(400).json({
        message: "Failed to create property",
        error: error.message,
      });
    }
  }),

  getAllProperties: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log("User ID:", userId);
    const properties = await Property.find({
      $or: [
        { ownerId: userId },
        { agentId: userId },
      ],
    })
      .populate("ownerId", "username email")
      .populate("agentId", "username email");
  
    res.status(200).json(properties);
  }),
  

  getProperties: asyncHandler(async (req, res) => {
    const properties = await Property.find()
    res.send(properties);
}),
  

  getSingleProperty: asyncHandler(async (req, res) => {
    const { id } = req.params;
const property = await Property.findById(id)
    .populate("agentId", "username email ")
      .populate("ownerId", "username email");
  
    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }
  
    res.status(200).json({ property });
  }),
  

  showProperty: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate("agentId", "username email profilePic")
      .populate("ownerId", "username email profilePic");
  
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    const reviews=await Review.find({property:id}).populate("user", "username profilePic")
    
  
    res.status(200).json({property,reviews});
  }),
  

 // Update Property Controller
 updateProperty: asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid property ID" });
  }

  const property = await Property.findById(id);
  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  const {
    title,
    propertyType,
    price,
    description,
    propertyFor,
    bedrooms,
    bathrooms,
    kitchens,
    parkingSpot,
    district,
    location,
    area,
    latitude,
    longitude,
    features,
    isAvailable,
  } = req.body;

  property.title = title || property.title;
  property.propertyType = propertyType || property.propertyType;
  property.price = price !== undefined ? Number(price) : property.price;
  property.description = description || property.description;
  property.propertyFor = propertyFor || property.propertyFor;
  property.district = district || property.district;
  property.location = location || property.location;
  property.area = area !== undefined ? Number(area) : property.area;
  property.latitude = latitude !== undefined ? Number(latitude) : property.latitude;
  property.longitude = longitude !== undefined ? Number(longitude) : property.longitude;
  property.features = features !== undefined ? String(features) : property.features;
  property.parkingSpot = parkingSpot !== undefined ? (parkingSpot === "true" || parkingSpot === true) : property.parkingSpot;
  property.isAvailable = isAvailable !== undefined ? (isAvailable === "true" || isAvailable === true) : property.isAvailable;

  if (["home", "flat", "both"].includes(property.propertyType)) {
    property.bedrooms = bedrooms !== undefined ? Number(bedrooms) : property.bedrooms;
    property.bathrooms = bathrooms !== undefined ? Number(bathrooms) : property.bathrooms;
    property.kitchens = kitchens !== undefined ? Number(kitchens) : property.kitchens;
  } else {
    property.bedrooms = undefined;
    property.bathrooms = undefined;
    property.kitchens = undefined;
  }

  if (req.files?.photos) {
    property.photos = Array.isArray(req.files.photos)
      ? req.files.photos.map((file) => file.path)
      : [req.files.photos.path];
  }

  if (req.files?.videos) {
    property.videos = Array.isArray(req.files.videos)
      ? req.files.videos.map((file) => file.path)
      : [req.files.videos.path];
  }

  const updatedProperty = await property.save();
  res.json({ message: "Property updated successfully", property: updatedProperty });
}),




  deleteProperty: asyncHandler(async (req, res) => {
    const { id } = req.params; // ✅ Use req.params
  
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }
  
    res.status(200).json({ message: "Property deleted successfully" });
  }),
  

  searchProperties: asyncHandler(async (req, res) => {
    
    const {
      district,
      propertyType,
      minPrice,
      maxPrice,
      isAvailable,
      propertyFor
    } = req.body;
    console.log("Raw data check:", { district, propertyType, minPrice, maxPrice, propertyFor });

    const filters = {
      ...(district && { district: { $regex: district, $options: "i" } }),
      ...(propertyType && { propertyType }),
      ...(minPrice !== undefined && maxPrice !== undefined && {
        price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
      }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(propertyFor && { propertyFor }),
    };
  
    console.log("Received filters:", filters);
  
    const properties = await Property.find(filters);
    res.status(200).json(properties);
  }),


  getPropertyById: asyncHandler(async (req, res) => { 
    const { id } = req.params;
const property = await Property.findById(id)
    .populate("agentId", "username email profilePic")
      .populate("ownerId", "username email profilePic");
  
    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }
  
    res.status(200).json({ property });
  }),


getProfileByUserId : async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get reviews for this user (reviewedUser)
    const reviews = await Review.find({ reviewedUser: userId }).populate("user", "name _id");
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
      averageRating: user.averageRating,
      roleData: {
        licenseNumber: user.licenseNumber,
        experience: user.experience,
        bio: user.bio,
        averageRating: averageRating.toFixed(1),
        profilePic: user.profilePic,
      },
      reviews,
    });
  } catch (error) {
    console.error("getProfileByUserId error:", error);
    res.status(500).json({ message: "Server error" });
  }
},

// Example using Mongoose
getFeaturedProperties : async (req, res) => {
  try {
    const featured = await Property.find({ isAvailable: true })
      .sort({ averageRating: -1 }) // highest rated first
      .limit(3); // top 6

    res.status(200).json(featured);
  } catch (err) {
    res.status(500).json({ message: "Error fetching featured properties" });
  }
},

 getGoodReviews : async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } }) // only good reviews
      .sort({ rating: -1, createdAt: -1 }) // best & latest first
      .limit(3) // top 3
      .populate("user", "username"); // show reviewer name

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
},

  
};

module.exports = propertyController;