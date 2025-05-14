const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      // The customer submitting the complaint
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    targetUser: {
      // The agent or owner the complaint is against
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Rejected'],
      default: 'Pending',
    },

    response: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
