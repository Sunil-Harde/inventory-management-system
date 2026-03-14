// File: controllers/supplier.controller.js
const Suppliers = require('../models/Supplier.module.js');
const mongoose = require("mongoose"); // Moved to the top!

const createSupplier = async (req, res, next) => {
  try {
    const { phone, email, companyName, contactPerson, address } = req.body;

    if (!phone || !companyName || !email) {
      return res.status(400).json({
        message: "all filled required"
      });
    }

    const newSuppliers = await Suppliers.create({
      phone,
      companyName,
      email,
      contactPerson,
      address
      
    });

    return res.status(201).json({
      status: "success",
      data: newSuppliers
    });

  } catch (err) {
    next(err);
  }
};

const getSupplier = async (req, res, next) => {
  try {
    const findSupplier = await Suppliers.find();

    if (!findSupplier || findSupplier.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Supplier Present"
      });
    }

    return res.status(200).json({
      success: true,
      totalSupplier: findSupplier.length,
      data: findSupplier
    });

  } catch (err) {
    next(err);
  }
};

const getOneSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const findSupplier = await Suppliers.findById(supplierId);

    // Fixed: findById returns an object, so we just check if it's null (no .length needed)
    if (!findSupplier) {
      return res.status(404).json({
        success: false,
        message: "No Supplier Present"
      });
    }

    return res.status(200).json({
      success: true,
      data: findSupplier
    });

  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const deleteSupplier = await Suppliers.findByIdAndDelete(supplierId);

    if (!deleteSupplier) {
      return res.status(404).json({
        message: "Supplier Not Present"
      });
    }

    return res.status(200).json({
      status: true,
      message: `Supplier Deleted successfully`,
      data: deleteSupplier
    });

  } catch (err) {
    next(err);
  }
};

const updateSupplier = async (req, res, next) => {
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
    next(err);
  }
};

module.exports = {
  createSupplier,
  getSupplier,
  deleteSupplier,
  updateSupplier,
  getOneSupplier
};