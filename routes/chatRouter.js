const express = require("express");
const isAuth = require("../middlewares/isAuth");
const agentController = require("../controllers/agentController");
const Message = require("../models/chatModel");
const chatController = require("../controllers/chatController");
const chatRouter = express.Router();

chatRouter.get("/customers", isAuth, chatController.getCustomers);
chatRouter.get("/:roomId", chatController.getMessages);
  
  // Save a new message
chatRouter.post("/", chatController.postMessage);



module.exports = chatRouter;

