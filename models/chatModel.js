const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: {  type: mongoose.Schema.Types.ObjectId, 
          ref: 'User', 
          required: true  },
receiverId: {  type: mongoose.Schema.Types.ObjectId, 
          ref: 'User', 
          required: true  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;