// File: controllers/transaction.controller.js
const Transaction = require('../models/Transaction.module.js');
const Product = require('../models/Product.module.js'); 

// 1. Create a Transaction (POST)
const createTransaction = async (req, res) => {
    try {
        const { productId, type, quantity, referenceNumber, remarks } = req.body;

        // UPGRADE 1: Prevent the Negative Number Exploit
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Quantity must be a valid number greater than zero." 
            });
        }

        // UPGRADE 2: Strict Type Checking
        if (type !== 'IN' && type !== 'OUT') {
            return res.status(400).json({ 
                status: "fail", 
                message: "Transaction type must be exactly 'IN' or 'OUT'." 
            });
        }

        // Step 1: Find the actual product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: "fail", message: "Product not found!" });
        }

        // Step 2: Calculate the new stock
        if (type === 'IN') {
            product.currentStock += quantity; // Cleaner syntax for addition
        } else if (type === 'OUT') {
            if (product.currentStock < quantity) {
                return res.status(400).json({ 
                    status: "fail", 
                    message: `Not enough stock! You only have ${product.currentStock} left.` 
                });
            }
            product.currentStock -= quantity; // Cleaner syntax for subtraction
        }

        // UPGRADE 3: Prepare the transaction document (but don't save it to the database yet)
        const newTransaction = new Transaction({
            productId,
            type,
            quantity,
            referenceNumber,
            remarks
        });

        // UPGRADE 3 (Cont.): Save BOTH the product and the transaction at the exact same time!
        // If one fails, it reduces the chance of your inventory math getting out of sync.
        await Promise.all([
            product.save(),
            newTransaction.save()
        ]);

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

// 2. Get All Transactions (GET)
const getAllTransactions = async (req, res) => {
    try {
        // Excellent job on the populate and sort logic here!
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