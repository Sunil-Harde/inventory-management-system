const express = require('express');
const { handelCreateSupplier } = require('../controllers/supplier.controller');


const routes = express.Router()

routes.post('/supplier' , handelCreateSupplier)

module.exports = routes;
