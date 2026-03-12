const express = require('express');
const { 
    createSupplier, 
    getSupplier, 
    deleteSupplier, 
    updateSupplier,
    getOneSupplier 
} = require('../controllers/supplier.controller.js');

const routes = express.Router();

// These become /api/suppliers
routes.post('/', createSupplier);
routes.get('/', getSupplier);

// These become /api/suppliers/:id
routes.get('/:id', getOneSupplier);
routes.put('/:id', updateSupplier);
routes.delete('/:id', deleteSupplier);

module.exports = routes;