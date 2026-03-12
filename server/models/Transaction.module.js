// File: models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Link to the exact auto part
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    // Is stock coming IN or going OUT?
    type: { 
        type: String, 
        enum: ['IN', 'OUT'], 
        required: true 
    },
    // How many items?
    quantity: { 
        type: Number, 
        required: true,
        min: 1 // You can't move 0 or negative items
    },
    // Optional: Invoice number or Bill number
    referenceNumber: { 
        type: String 
    },
    // Optional: Notes about the transaction
    remarks: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);