const asyncHandler = require("express-async-handler");
const Complaint = require("../models/complaintModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const complaintController = {
  fileComplaint: asyncHandler(async (req, res) => {
    const { targetUser, description } = req.body;

    console.log(req.body);
    

    // Check if target user exists
    const reportedUser = await User.findById(targetUser);
    if (!reportedUser) {
      res.status(404);
      throw new Error("Target user not found");
    }

    const complaint = new Complaint({
      user: req.user.id,          // customer ID
      targetUser,                 // reported user's ID
      description,
    });

    await complaint.save();
        // Create a notification for the target user (reported user)
        const notificationMessage = `⚠️ A complaint has been filed against you by someone.<br><strong>  Complaint: </strong> ${complaint.description}`;


        await Notification.create({
            user: targetUser,  // The user being reported
            message: notificationMessage,
            complaintId: complaint._id,  // Associate the complaint ID with the notification
        });
    res.status(201).json({ message: "Complaint filed successfully" });
  }),

  getAllComplaints: asyncHandler(async (req, res) => {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('user', 'username email')
      .populate('targetUser', 'username email');
  
    res.send(complaints);
  }),
  

  getUserComplaints :asyncHandler(async (req, res) => {
      const complaints = await Complaint.find({ user: req.user.id }).populate('user', 'name');
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),

  updateComplaintStatus: asyncHandler(async (req, res) => {
    const { id, status, response } = req.body;
    console.log('Received payload:', { id, status, response });
  
    const complaint = await Complaint.findById(id).populate("user", "name");
    if (!complaint) throw new Error('Complaint not found');
  
    complaint.status = status || '';
    complaint.response = response || '';
    await complaint.save();
  
    // Create notification for the user who filed the complaint
    const message = `
      ✅ Your complaint status has been updated by admin.<br>
      <strong>Status:</strong> ${status}<br>
      <strong>Response:</strong> ${response}
    `;
  
    await Notification.create({
      user: complaint.user._id,
      message,
      complaintId: complaint._id,
    });
  
    res.send({ message: 'Complaint updated successfully', complaint });
  }),

  deleteComplaint: asyncHandler(async (req, res) => {
    try {
      console.log("Delete called with ID:", req.params.id);
  
      const { id } = req.params;
  
      if (!id) {
        res.status(400);
        throw new Error("Complaint ID is required");
      }
  
      const complaint = await Complaint.findById(id);
  
      if (!complaint) {
        res.status(404);
        throw new Error("Complaint not found");
      }
  
      await complaint.deleteOne();
  
      console.log("Complaint deleted successfully");
      res.status(200).json({ message: "Complaint deleted successfully" });
  
    } catch (error) {
      console.error("Delete complaint error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }),
  
  
}
module.exports=complaintController