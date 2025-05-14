const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { upload } = require("../middlewares/cloudinary");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Review = require("../models/reviewModel");

const userController = {
    register: asyncHandler(async (req, res) => {
        try {
          console.log("Incoming Register Request:", req.body);
      
          const { name, middleName, lastName, username, email, password, role, address, phone, experience, licenseNumber, bio } = req.body;
      
          const userExists = await User.findOne({ email });
          if (userExists) {
            return res.status(400).json({ message: "User already exists" });
          }
      
          const hashedPassword = await bcrypt.hash(password, 10);
      
          const userCreated = await User.create({
            name,
            middleName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role,
            address,
            phone,
            experience,
            licenseNumber,
            bio,
          });
      
          const payload = {
            email: userCreated.email,
            id: userCreated.id,
            role: userCreated.role,
          };
      
          const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
          });
      
          res.json({ token, role });
        } catch (error) {
          console.error("❌ Register Error:", error); // This will show the real error
          res.status(500).json({ message: "Something went wrong", error: error.message });
        }
      }),
      

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
    

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { email: userExist.email, id: userExist.id , verified:userExist.verified, role:userExist.role, };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });


        res.json({ token, role: userExist.role, name: userExist.name ,username:userExist.username, verified:userExist.verified});
    }),

    logout: asyncHandler(async (req, res) => {
        res.clearCookie("token");
        res.json({ message: "User logged out" });
    }),


    profile: asyncHandler(async (req, res) => {
        const { username, name, email, password, phone, address, licenseNumber, bio, experience } = req.body;
        const userId = req.user.id;
      

      
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      
        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }
      
        user.username = username || user.username;
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.licenseNumber = licenseNumber || user.licenseNumber;
        user.bio = bio || user.bio;
        user.experience = experience || user.experience;
      
        if (req.file) {
          user.profilePic = req.file.path; // 👈 this is the image URL from Cloudinary
        }
      
        const updatedUser = await user.save();
        res.json({ message: "Profile updated successfully", user: updatedUser });
      }),
      

    getUserProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Profile Completion Check
        let isProfileComplete = user.name && user.email;
        if (user.role === "agent" || user.role === "owner") {
            isProfileComplete = isProfileComplete && user.phone;
        }
        const reviews=await Review.find({reviewedUser:userId}).populate("user", "username profilePic")
    
        res.json({ message: "User details retrieved successfully", user, isProfileComplete, reviews });
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log(email); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();
       // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
  });

  const resetLink = `${process.env.FRONTEND_URL}/resetpassword?token=${resetToken}&email=${email}`;


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click on this link to reset your password: ${resetLink}`,
        };
transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Email could not be sent" });
            }
            res.json({ message: "Reset link sent to your email" });
        });
    }),
    resetPassword: asyncHandler(async (req, res) => {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ email });
        console.log(email, token, newPassword);
        if (!user || !user.resetPasswordToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password reset successful" });
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
    
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
    
        res.json({ message: "Password updated successfully" });
    }),
    

};

module.exports = userController;
