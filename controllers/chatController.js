const asyncHandler = require("express-async-handler");
const Message = require("../models/chatModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const chatController = {
    getCustomers: asyncHandler(async (req, res) => {
        const chatHistory = await Message.find({ receiverId: req.user.id }).populate("senderId", "id username profilePic ");
        const uniqueCustomers = new Map();
    
        chatHistory.forEach(message => {
            if (message.senderId && !uniqueCustomers.has(message.senderId._id.toString())) {
                uniqueCustomers.set(message.senderId._id.toString(), {
                    id: message.senderId._id,
                    username: message.senderId.username,
                    profilePic: message.senderId.profilePic,
                    lastMessage:message.message
                });
            }
        });
    
        // Convert the map values to an array
        const uniqueCustomersArray = Array.from(uniqueCustomers.values());
        
        res.status(200).json(uniqueCustomersArray);
    }),
    getMessages:async (req, res) => {
      try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        res.json(messages);
      } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
      }
    },
    postMessage:async (req, res) => {
        try {
          const { roomId, senderId, receiverId, message, timestamp } = req.body;

              // Log the incoming data to see if it's correct
    console.log("Received message data:", req.body);
    console.log(receiverId);
    
      
          const newMessage = new Message({
            roomId,
            senderId,
            receiverId,
            message,
            timestamp,
          });
      
          await newMessage.save();
           
    // Get sender's username
    const sender = await User.findById(senderId).select('username');
    const senderUsername = sender?.username || "Someone";

    // Create a notification for the receiver
    const notificationMessage = `${senderUsername} sent you a message.`;
    await Notification.create({
      user: receiverId,
      message: notificationMessage,
    });
          res.status(201).json(newMessage);
        } catch (error) {
          res.status(500).json({ message: "Error saving message", error });
        }
      },
}
module.exports =chatController;