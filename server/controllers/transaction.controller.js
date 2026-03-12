// File: controllers/transaction.controller.js
const Transaction = require('../models/Transaction.module.js');
const Product = require('../models/Product.module.js'); // We need this to update the stock!

// 1. Create a Transaction (POST)
const createTransaction = async (req, res) => {
    try {
        const { productId, type, quantity, referenceNumber, remarks } = req.body;

        // Step 1: Find the actual product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: "fail", message: "Product not found!" });
        }

        // Step 2: Calculate the new stock based on IN or OUT
        if (type === 'IN') {
            product.currentStock = product.currentStock + quantity;
        } else if (type === 'OUT') {
            // Check if we actually have enough stock to sell!
            if (product.currentStock < quantity) {
                return res.status(400).json({ 
                    status: "fail", 
                    message: `Not enough stock! You only have ${product.currentStock} left.` 
                });
            }
            product.currentStock = product.currentStock - quantity;
        }

        // Step 3: Save the updated product stock
        await product.save();

        // Step 4: Save the transaction record (the receipt)
        const newTransaction = await Transaction.create({
            productId,
            type,
            quantity,
            referenceNumber,
            remarks
        });

        // Step 5: Send success response
        res.status(201).json({
            status: "success",
            message: `Successfully processed ${type} transaction.`,
            data: {
                transaction: newTransaction,
                newStockLevel: product.currentStock
            }
        });

    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('productId', 'partName sku')
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            status: "success",
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

module.exports = {
    createTransaction,
    getAllTransactions
};