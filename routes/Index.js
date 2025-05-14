const express=require("express");
const userRouter = require("./userRouter");
const agentRouter = require("./agentRouter");
const propertyRouter = require("./propertyRouter");
const adminRouter = require("./adminRouter");
const chatRouter = require("./chatRouter");
const wishlistRouter = require("./wishlistRoutes");
const reviewRouter = require("./reviewRouter");
const paymentRouter = require("./paymentRouter");
const complaintRouter = require("./complaintRoutes");
const notificationRouter = require("./notificationRouter");
const chartRouter = require("./chartRouter");




const router=express();

router.use("/users",userRouter)
router.use("/agent", agentRouter);
router.use("/property", propertyRouter);
router.use("/admin", adminRouter);
router.use("/messages", chatRouter);
router.use("/wishlist", wishlistRouter);
router.use("/review",reviewRouter );
router.use("/payments",paymentRouter);
router.use("/complaints",complaintRouter);
router.use("/notifications",notificationRouter);
router.use("/charts", chartRouter)

module.exports=router