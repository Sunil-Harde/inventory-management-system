const Suppliers = require('../models/supplier.module')

const createSupplier = async (req, res) => {
    try {

        const { phone, email, companyName, contactPerson, address } = req.body

        if (!phone || !companyName || !email) {
            return res.status(400).json({
                message: "all filled required"
            })
        }

        const newSuppliers = await Suppliers.create({
            phone,
            companyName,
            email,
            contactPerson,
            address
        })

        return res.status(201).json({
            status: "success",
            data: newSuppliers
        })

    }

    catch (err) {

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const value = err.keyValue[field];


            return res.status(400).json({
                status: "error",
                message: `${value} already exists`,
            });
        }

        return res.status(500).json({
            status: "Error",
            error: err
        })
    }
}

const getSupplier = async (req, res) => {

    try {

        const findSupplier = await Suppliers.find()

        if (!findSupplier || findSupplier.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Supplier Present"
            })
        }

        return res.status(200).json({
            success: true,
            totalSupplier: findSupplier.length,
            data: findSupplier
        })

    }

    catch (err) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}


const getOneSupplier = async (req, res) => {

    try {

        const supplierId = req.params.id

        const findSupplier = await Suppliers.findById(supplierId)

        if (!findSupplier || findSupplier.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Supplier Present"
            })
        }

        return res.status(200).json({
            success: true,
            totalSupplier: findSupplier.length,
            data: findSupplier
        })

    }

    catch (err) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}


const deleteSupplier = async (req, res) => {

    try {

        const supplierId = req.params.id
        const deleteSupplier = await Suppliers.findByIdAndDelete(supplierId)

        if (!deleteSupplier) {
            return res.status(404).json({
                message: "Supplier Not Present"
            })
        }

        return res.status(200).json({
            status: true,
            message: `Supplier Deleted successfully`,
            data: deleteSupplier
        })

    }

    catch (err) {

        res.status(404).json({
            message: err,
            get: "Error"
        })
    }


}


const mongoose = require("mongoose");

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, email, companyName, contactPerson, address } = req.body;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID"
      });
    }

    // 2️⃣ Validate required fields ( should update full resource)
    if (!phone || !companyName || !email) {
      return res.status(400).json({
        success: false,
        message: "Phone, company name and email are required"
      });
    }

    // 3️⃣ Update supplier
    const updatedSupplier = await Suppliers.findByIdAndUpdate(
      id,
      {
        phone,
        email,
        companyName,
        contactPerson,
        address
      },
      {
        new: true,          // return updated document
        runValidators: true // run schema validation
      }
    );

    // 4️⃣ If not found
    if (!updatedSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    // 5️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier
    });

  } catch (err) {

    // Handle duplicate unique fields
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];

      return res.status(400).json({
        success: false,
        message: `${field} '${value}' already exists`
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports = {
    createSupplier,
    getSupplier,
    deleteSupplier,
    updateSupplier,
    getOneSupplier
}