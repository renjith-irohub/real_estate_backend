const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique:true,
        minLength:[5,"Minimum 5 characters required"],
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name:{ 
    type: String, 
    required: true,
  },
  middleName:{ 
    type: String, 
  },
  lastName:{ 
    type: String, 
  },
  password: { 
    type: String, 
    minLength:[5,"Minimum 5 characters required"]
  },
  role: { 
    type: String, 
    enum: ["agent", "admin", "customer","owner"], 
    required: true 
  },
  phone: { 
      type: String,
      default:''
  },
  profilePic:{
    type: String,
      default:''
  },
  address:{ 
      type:  String,
      default:''
  },
  verified: {
    type: Boolean,
    default: false,
  },  
  experience: {
    type: Number,
    default: 0,
  },
  licenseNumber: {
    type: String,
   default:''
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  propertyLimit: {
    type: Number,
    default:5,
  },
  averageRating: {
    type: Number,
    default: 0,
  },

  subscription: { 
    type: String, 
    enum: ['default', 'basic', 'premium', 'vip'], 
    default: 'default' 
  },

  resetPasswordToken:{
    type:String
   },  
  

  wishlist: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Property" 
    }
  ],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;