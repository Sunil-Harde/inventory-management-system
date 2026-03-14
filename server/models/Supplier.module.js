const mongoose = require("mongoose");

const suppliersSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true // Added 'd'
    },
    phone: {
        type: String,
        required: true // Added 'd'
    },
    contactPerson: {
        type: String,
    },
    email: {
        type: String,
        unique: false,
        required: true // Added 'd'
    },
    address: {
        type: String
    }
}, {
    timestamps: true
});

// THE FIX: Changed "Suppliers" to "Supplier" to match your Product's ref exactly
const Supplier = mongoose.model("Supplier", suppliersSchema);

module.exports = Supplier;
