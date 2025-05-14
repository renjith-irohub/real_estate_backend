const express = require("express");
const agentController = require("../controllers/agentController");
const isAuth = require("../middlewares/isAuth");
const { upload } = require("../middlewares/cloudinary");
const agentRouter = express.Router();

agentRouter.get("/viewall", isAuth, agentController.getAllAgents);
agentRouter.get("/search/:id", isAuth, agentController.getAgentById); // Updated to use params
agentRouter.get("/profile", isAuth, agentController.getAgentProfile);
agentRouter.put("/profile", isAuth, upload.single("image"), agentController.upsertAgent);

module.exports = agentRouter;