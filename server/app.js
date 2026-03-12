const express = require("express");
const cors = require("cors"); 
const connectToMongodb = require("./config/db");

const errorHandling = require("./middleware/error.middleware.js")
const useInventory = require('./routes/inventory.routes.js');
// 1. Import your route files
const supplierRoutes = require('./routes/supplier.routes.js');
const reportRoutes = require('./routes/report.routes.js'); // NEW: Import reports
const transactionRoutes = require('./routes/transaction.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');

const app = express();


// 2. Global Middleware
app.use(cors()); 
app.use(express.json()); 

connectToMongodb();

// 4. Base Test Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "InventIQ API is running successfully!"
    });
});

// 5. Mount the API Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api', reportRoutes); // NEW: Connect the dashboard API
app.use('/api/inventory', useInventory);
app.use('/api', transactionRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.use(errorHandling); 

// 6. Start the Server directly on port 5000
app.listen(5000, () => {
    console.log("🚀 Server Created on port 5000");
});