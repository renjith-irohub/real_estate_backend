const Agent = require("../models/agentModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const agentController = {
  // Get All Agents with Reviews
  getAllAgents: asyncHandler(async (req, res) => {
    const agents = await Agent.find().populate("reviews").populate("user", "name email");
    res.status(200).json(agents);
  }),

  // Get Agent by ID (from params)
  getAgentById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const agent = await Agent.findOne({ user: id }).populate("reviews").populate("user");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json({ agent, user: agent.user });
  }),

  // Get Logged-in Agent Profile
  getAgentProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }
    const agent = await Agent.findOne({ user: req.user.id }).populate("reviews");
    res.status(200).json({ user, agent: agent || {} });
  }),

// ✅ Create or Update Agent Details (Used in profile update)
upsertAgent: asyncHandler(async (req, res) => {
    const { name, email, phone, address, experience, licenseNumber, bio } = req.body;
  
    // 1. Update User Info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();
  
    // 2. Create or Update Agent Info
    let agent = await Agent.findOne({ user: req.user.id });
  
    if (agent) {
      // 🛑 Only check for conflict if licenseNumber is provided & changed
      if (
        licenseNumber &&
        licenseNumber !== agent.licenseNumber
      ) {
        const existing = await Agent.findOne({ licenseNumber });
        if (existing) {
          return res.status(400).json({ message: "License number already exists" });
        }
      }
  
      agent.licenseNumber = licenseNumber || agent.licenseNumber;
      agent.experience = experience || agent.experience;
      agent.bio = bio || agent.bio;
  
    } else {
      // 🛑 Only check for duplicate license if provided
      if (licenseNumber) {
        const existingAgent = await Agent.findOne({ licenseNumber });
        if (existingAgent) {
          return res.status(400).json({ message: "License number already exists" });
        }
      }
  
      agent = new Agent({
        user: req.user.id,
        licenseNumber: licenseNumber || undefined,
        experience,
        bio,
      });
    }
  
    agent.profileCompleted = !!(agent.licenseNumber && agent.experience && agent.bio);
  
    const savedAgent = await agent.save();
    res.status(agent.isNew ? 201 : 200).json({ user, agent: savedAgent });
  }),
  
};

module.exports = agentController;