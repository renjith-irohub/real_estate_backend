const mongoose = require("mongoose");
const User = require("../models/userModel");
const Payment = require("../models/paymentModel"); // make sure this path is correct
const Property = require("../models/propertyModel"); // make sure this path is correct

const nodemailer = require("nodemailer");

// GET /admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// GET /admin/user/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId, { session });
    if (!deletedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all properties where the user is either agentId or ownerId
    const deletedProperties = await Property.deleteMany(
      {
        $or: [{ agentId: userId }, { ownerId: userId }],
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    // Send email notification about user deletion
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: deletedUser.email,
      subject: "Account Deletion Notification",
      text: `Hello ${deletedUser.name},\n\nYour account has been deleted from our platform because of your activity. If you believe this was a mistake, please contact support.\n\nBest regards,\nThe Team`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error sending email" });
      }
      console.log("Email sent:", info.response);
    });

    res.status(200).json({
      message: "User and their data deleted successfully",
      deletedProperties: deletedProperties.deletedCount,
      // deletedPayments: deletedPayments.deletedCount, // Uncomment if payments are deleted
    });
  } catch (err) {
    // Roll back transaction on error
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};



const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Send Email on Verification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Account Verified Successfully",
      text: `Hi ${user.name},

We are happy to inform you that your account has been successfully verified by the admin.

You can now log in and start using all the features of our platform.

Thank you for being with us!

Best regards,  
The Team`
 };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        return res.status(500).json({
          message: "User verified but email failed to send",
          user,
        });
      }
      res.status(200).json({
        message: "User verified successfully and email sent",
        user,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify user", error: err.message });
  }
};


// GET /admin/payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
    .populate([
      { path: 'agentId', select: 'name username email role' },
      { path: 'ownerId', select: 'name username email role' }
    ])
    
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

const getDashboardCounts = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalVIPCustomers = await Payment.countDocuments({ paymentPlan: "vip" });

    // Total revenue (all payments)
    const totalRevenueResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalRevenueResult[0]?.totalAmount || 0;

    // Agent revenue
    const agentRevenueResult = await Payment.aggregate([
      { $match: { userRole: "agent" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const agentRevenue = agentRevenueResult[0]?.totalAmount || 0;

    // Owner revenue
    const ownerRevenueResult = await Payment.aggregate([
      { $match: { userRole: "owner" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const ownerRevenue = ownerRevenueResult[0]?.totalAmount || 0;

    res.status(200).json({
      totalUsers,
      totalProperties,
      totalAmount,
      totalVIPCustomers,
      agentRevenue,
      ownerRevenue,
    });
  } catch (error) {
    console.error("Dashboard count error:", error);
    res.status(500).json({ message: "Error fetching dashboard counts" });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  deleteUserById,
  verifyUser,
  getAllPayments, // added this
  getDashboardCounts ,
};
