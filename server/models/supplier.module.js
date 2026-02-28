const mongoose = require("mongoose")

const suppliersSchema = mongoose.Schema({

    companyName: {
        type: String,
        require: true
    },

    phone: {
        type: String,
        require: true
    },

    contactPerson: {
        type: String,
    },

    email: {
        type: String,
        unique: true
    },

    address: {
        type: String
    }

}, {
    timestamps: true
})



const Suppliers = mongoose.model("Suppliers", suppliersSchema)

module.exports = Suppliers