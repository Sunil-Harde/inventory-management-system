// File: routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getUniqueBrands
} = require('../controllers/inventory.controller.js');

// GET and POST for the main list
router.post('/', createProduct);
router.get('/', getAllProducts);

// Becomes GET /api/inventory/brands
router.get('/brands', getUniqueBrands);

// GET, PUT, and DELETE for specific items (Requires ID)
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Special route for image uploads
router.post('/:id/image', uploadProductImage);

module.exports = router;