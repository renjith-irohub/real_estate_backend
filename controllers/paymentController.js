const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");
const Property = require("../models/propertyModel");
const Stripe = require("stripe");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const paymentController = {
    // Get all payments for an agent
    getPayments: asyncHandler(async (req, res) => {
        const payments = await Payment.find({ agentId: req.user.id })
            .populate("agentId", "name username email")
            .sort({ createdAt: -1 });

        res.json(payments);
    }),

    // Get a single payment by ID
    getPaymentById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const payment = await Payment.findById(id);

        if (payment) {
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Update payment status (for admin purposes)
    updatePaymentStatus: asyncHandler(async (req, res) => {
        const { id, status } = req.body;
        const payment = await Payment.findById(id);

        if (payment) {
            payment.paymentStatus = status;
            await payment.save();
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Check if an agent needs to pay before listing a property
    checkPaymentRequirement: asyncHandler(async (req, res, next) => {
        const agentId = req.user.id;

        const propertyCount = await Property.countDocuments({ agentId });

        if (propertyCount >= 5) {
            const activeSubscription = await Payment.findOne({
                agentId,
                paymentType: "subscription",
                paymentStatus: "completed",
                subscriptionExpiry: { $gte: new Date() }
            });

            if (!activeSubscription) {
                return res.status(403).json({ 
                    message: "Payment required to list more than 5 properties." 
                });
            }
        }
        next();
    }),

    // Process payment using Stripe
    processPayment: asyncHandler(async (req, res) => {
        const { plan, role } = req.body; // 'role' should be either 'owner' or 'agent'
        const userId = req.user.id;
        const user=await User.findById(userId);
        
        const plans = {
          basic: { price: 200, propertyLimit: 10 },
          premium: { price: 400, propertyLimit: 15 },
          vip: { price: 600, propertyLimit: 25 },
        };
      
        const selectedPlan = plans[plan];
        user.propertyLimit=plans[plan].propertyLimit;
        user.subscription=plan;
        await user.save();
        if (!selectedPlan) {
          return res.status(400).json({ message: "Invalid plan selected." });
        }
      
        // Build dynamic query based on role
        const query = {
          paymentPlan: plan,
          paymentStatus: "completed",
        };
        if (role === "owner") query.ownerId = userId;
        else if (role === "agent") query.agentId = userId;
        else return res.status(400).json({ message: "Invalid role provided." });
      
        // Check if same plan already bought
        const existingPayment = await Payment.findOne(query);
        if (existingPayment) {
          return res.status(400).json({ message: `You already have the ${plan} plan.` });
        }
      
        const paymentIntent = await stripe.paymentIntents.create({
            amount: selectedPlan.price * 100, // Stripe requires amount in cents
            currency: "USD",
          });

        // Save payment (simulate success)
        const newPaymentData = {
          amount: selectedPlan.price,
          paymentPlan: plan,
          propertyLimit: selectedPlan.propertyLimit,
          paymentMethod: "credit-card",
          paymentStatus: "completed",
          transactionId: paymentIntent.id,
        };
      
        if (role === "owner") newPaymentData.ownerId = userId;
        if (role === "agent") newPaymentData.agentId = userId;
      
       

        const newPayment = new Payment(newPaymentData);
        await newPayment.save();

            // Create a notification for the user
    const notificationMessage = `💳 Payment Successful: Your ${plan} plan has been activated with ${selectedPlan.propertyLimit - 5} properties allowed.`;

    await Notification.create({
        user: userId,
        message: notificationMessage,
    });
      
        res.status(201).json({ message: "Payment successful", payment: newPayment,clientSecret: paymentIntent.client_secret });
      }),
      
      getPropertyLimit: asyncHandler(async (req, res) => {
       const user=await User.findById(req.user.id);     
       res.send({propertyLimit:user.propertyLimit});
      }),
      
    // Handle Stripe webhook events
    webhook: asyncHandler(async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY);
        } catch (err) {
            console.log(err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                const payment=await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: "completed" }
                );
                await Notification.create({
                    user: payment.agentId,
                    message: `🎉 Payment Successful! .`,
                });
                return res.status(200).send("💰 Payment succeeded!");

            case "checkout.session.completed":
                await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: "completed" }
                );
                return res.status(200).send("✅ Payment Completed");

            default:
                return res.status(200).send("Webhook received");
        }
    }),
};

module.exports = paymentController;
