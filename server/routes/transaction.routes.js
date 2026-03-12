// File: routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const { createTransaction, getAllTransactions } = require('../controllers/transaction.controller.js');

// This becomes POST /api/transactions
router.post('/transactions', createTransaction);

// This becomes GET /api/transactions
router.get('/transactions', getAllTransactions);

module.exports = router;