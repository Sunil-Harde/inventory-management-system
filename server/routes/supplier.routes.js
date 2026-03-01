const express = require('express');
const { handelCreateSupplier, getSupplier, deleteSupplier, updateSupplier,getOneSupplier } = require('../controllers/supplier.controller');


const routes = express.Router()

routes.post('/supplier' , handelCreateSupplier)
routes.get('/supplier' , getSupplier)
routes.get('/supplier/:id' , getOneSupplier)
routes.delete('/supplier/:id' , deleteSupplier)
routes.put('/supplier/:id' , updateSupplier)

module.exports = routes;
