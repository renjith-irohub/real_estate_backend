const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const notificationController = {
    getUserNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
        res.send(notifications);
    }),

    markNotificationAsRead: asyncHandler(async (req, res) => {
        const { id } = req.body;
        const notification = await Notification.findById(id);

        if (!notification) {
            throw new Error("Notification not found.");
        }

        notification.read = true;
        await notification.save();
        await notification.deleteOne();
        res.send("Notification marked as read.");
    }),

    deleteNotification: asyncHandler(async (req, res) => {
        const { id } = req.params; // <-- make sure you're passing id as a route param, not in body
    
        if (!id) {
            res.status(400);
            throw new Error("Notification ID is required.");
        }
    
        const notification = await Notification.findById(id);
    
        if (!notification) {
            res.status(404);
            throw new Error("Notification not found.");
        }
    
        await notification.deleteOne();
    
        res.status(200).json({ message: "Notification deleted successfully." });
    }),
    
    deleteAllNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find({ user: req.user.id });
        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found." });
        }

        await Notification.deleteMany({ user: req.user.id });
        res.status(200).json({ message: "All notifications deleted successfully." });
    }),
};

module.exports = notificationController;
