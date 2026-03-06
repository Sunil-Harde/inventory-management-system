// File: server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    partName: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    vehicleType: [{ type: String, enum: ['2W', '3W', '4W', 'EV'], required: true }],
    currentStock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    // ... (other fields like specifications and compatibleModels)
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);