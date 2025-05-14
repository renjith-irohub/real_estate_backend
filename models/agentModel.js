const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
  experience: {
    type: Number,
    required: true,
  },
  
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],

  averageRating: { 
    type: Number, 
    default: 0 
},
}, { timestamps: true });

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;