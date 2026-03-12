// File: controllers/inventory.controller.js
const Product = require('../models/Product.module.js');

// 1. POST /api/inventory - Add a new auto part
const createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({ status: "success", data: newProduct });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// 2. GET /api/inventory - Get all parts (WITH Query Params!)
const getAllProducts = async (req, res) => {
    try {
        // Build a filter object based on the query URL
        // Example URL: /api/inventory?category=EV&brand=Bosch
        let filter = {};
        
        if (req.query.category) {
            // Maps ?category=EV to the vehicleType array in your schema
            filter.vehicleType = req.query.category; 
        }
        
        // If you add a 'brand' field to your schema later, this will filter by it!
        if (req.query.brand) {
            filter.brand = req.query.brand;
        }

        const products = await Product.find(filter).populate('supplierId', 'companyName');
        
        res.status(200).json({ status: "success", count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// 3. GET /api/inventory/:id - Get full details of a specific part
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplierId');
        if (!product) return res.status(404).json({ status: "fail", message: "Part not found" });
        
        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// 4. PUT /api/inventory/:id - Update part details
const updateProduct = async (req, res) => {
    try {
        // { new: true } tells Mongoose to return the UPDATED document, not the old one
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) return res.status(404).json({ status: "fail", message: "Part not found" });

        res.status(200).json({ status: "success", message: "Part updated", data: updatedProduct });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// 5. DELETE /api/inventory/:id - Delete a discontinued part
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ status: "fail", message: "Part not found" });

        res.status(200).json({ status: "success", message: "Part deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// 6. POST /api/inventory/:id/image - Upload product image
const uploadProductImage = async (req, res) => {
    try {
        // Note: To make this actually accept files, we need a package called 'multer'!
        // For now, we are just saving an image URL sent as a string in the body.
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            { imageUrl: req.body.imageUrl }, // You will need to add imageUrl to your Schema!
            { new: true }
        );

        res.status(200).json({ status: "success", message: "Image uploaded", data: product });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};


const getUniqueBrands = async (req, res) => {
    try {
        // .distinct() automatically scans your products, removes duplicates, 
        // and returns a clean array like: ["Bosch", "Bajaj", "Minda"]
        const brands = await Product.distinct('brand');
        
        // Filter out any null/empty values just in case
        const cleanBrands = brands.filter(brand => brand != null && brand !== '');

        res.status(200).json({ 
            status: "success", 
            count: cleanBrands.length,
            data: cleanBrands 
        });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getUniqueBrands
};