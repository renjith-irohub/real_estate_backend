const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const Payment = require("../models/paymentModel");
const asyncHandler = require("express-async-handler");

const getUserRoleCounts = asyncHandler(async (req, res) => {
  const counts = await User.aggregate([
    {
      $match: {
        role: { $in: ["agent", "owner", "customer"] },
      },
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    agent: 0,
    owner: 0,
    customer: 0,
  };

  counts.forEach((item) => {
    result[item._id] = item.count;
  });

  res.json(result);
});

const getPropertyTypeCounts = asyncHandler(async (req, res) => {
    const counts = await Property.aggregate([
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 },
        },
      },
    ]);
  
    const result = {
      home: 0,
      land: 0,
      both: 0,
      flat: 0,
      commercial: 0,
    };
  
    counts.forEach((item) => {
      result[item._id] = item.count;
    });
  
    res.json(result);
  });

  // GET /charts/citywise
const getCityWiseChart = async (req, res) => {
    const data = await Property.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } }
    ]);
    res.json(data);
  };
  
  // GET /charts/subscriptions
  const getSubscriptionChart = async (req, res) => {
    const data = await User.aggregate([
      {
        $match: {
          subscription: { $ne: "" },
          role: { $ne: "admin" }
        }
      },
      {
        $group: {
          _id: "$subscription",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(data);
  };
  
  

  const getPaymentReport = async (req, res) => {
    try {
      const { from, to } = req.query;
      const query = {};
  
      if (from && to) {
        query.paymentDate = {
          $gte: new Date(from),
          $lte: new Date(to),
        };
      }
  
      const payments = await Payment.find(query)
        .sort({ paymentDate: -1 })
        .populate("agentId", "name role")
        .populate("ownerId", "name role");
  
      // Normalize and calculate role-based revenue
      let totalRevenue = 0;
      let agentRevenue = 0;
      let ownerRevenue = 0;
  
      const formattedPayments = payments.map((p) => {
        const user = p.agentId || p.ownerId;
        const role = user?.role || "unknown";
        const name = user?.name || "Unknown";
  
        totalRevenue += p.amount;
        if (role === "agent") agentRevenue += p.amount;
        if (role === "owner") ownerRevenue += p.amount;
  
        return {
          _id: p._id,
          amount: p.amount,
          paymentPlan: p.paymentPlan,
          paymentDate: p.paymentDate,
          user: {
            name,
            role,
          },
        };
      });
  
      res.status(200).json({
        payments: formattedPayments,
        totalRevenue,
        agentRevenue,
        ownerRevenue,
      });
    } catch (error) {
      console.error("Payment Report Error:", error);
      res.status(500).json({ error: "Failed to fetch payment report" });
    }
  };
  
  

  module.exports = {
    getUserRoleCounts,
    getPropertyTypeCounts, // add this here
    getCityWiseChart,
    getSubscriptionChart,
    getPaymentReport,
  };
