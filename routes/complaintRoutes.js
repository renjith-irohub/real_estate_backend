const express = require("express");
const isAuth = require("../middlewares/isAuth");
const complaintController = require("../controllers/complaintController");


const complaintRouter = express.Router();

complaintRouter.post("/add", isAuth, complaintController.fileComplaint);
complaintRouter.get("/getAll", isAuth, complaintController.getAllComplaints);
complaintRouter.put("/update", isAuth, complaintController.updateComplaintStatus);
complaintRouter.delete("/delete/:id", isAuth, complaintController.deleteComplaint);

module.exports = complaintRouter;
