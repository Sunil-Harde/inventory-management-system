// File: models/Product.js
const mongoose = require('mongoose');

// THE FIX: This registers the Supplier model before the Product model tries to use it.
require('./Supplier.module.js'); 

const productSchema = new mongoose.Schema({
    partName: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    
    // Vehicle Category (3W, EV, etc.)
    vehicleType: [{ type: String, enum: ['2W', '3W', '4W', 'EV'], required: true }],
    
    // Linking to the Supplier you made in Step 1
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    
    // Price and Stock
    price: { type: Number, required: true },
    currentStock: { type: Number, default: 0 }, // Always starts at 0
    minStockLevel: { type: Number, default: 5 },
    
    // Specific Auto Part Details
    compatibleModels: [String],
    specifications: {
        emissionStandard: { type: String, enum: ['BS3', 'BS4', 'BS6', 'N/A'], default: 'N/A' },
        fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'N/A'], default: 'N/A' },
        voltage: { type: String, default: '12V' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);