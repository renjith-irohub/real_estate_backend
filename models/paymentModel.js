const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    agentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Assuming agents are stored in the User model
        required: false 
    },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Assuming agents are stored in the User model
        required: false 
    },
    propertyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property', 
        required: false // Not required for subscription-based payments
    },
    amount: { 
        type: Number, 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ['credit-card', 'debit-card',  'paypal', 'upi'], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    },
    transactionId: { 
        type: String 
    },
    paymentPlan: { 
        type: String, 
        enum: ['basic', 'premium', 'vip' ], 
        required: true 
    },

    propertyLimit: { 
        type: Number, 
        default: 5 // Default limit for agents and owners
    },

    paymentDate: { 
        type: Date, 
        default: Date.now 
    },
    receiptUrl: { 
        type: String 
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
