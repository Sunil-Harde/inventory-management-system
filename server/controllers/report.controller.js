const Product = require("../models/products.module"); // Make sure your Product schema is imported!

const getInventoryValuation = async (req, res) => {
    try {
        const valuationData = await Product.aggregate([
            // 1. Split parts that belong to multiple vehicle types
            { $unwind: "$vehicleType" },

            // 2. Group by vehicle type and calculate total stock and value
            {
                $group: {
                    _id: "$vehicleType",
                    totalStock: { $sum: "$currentStock" },
                    totalValue: { $sum: { $multiply: ["$currentStock", "$price"] } }
                }
            },

            // 3. Format output perfectly for React charts
            {
                $project: {
                    _id: 0,
                    vehicleType: "$_id",
                    totalStock: 1,
                    totalValue: 1
                }
            },

            // 4. Sort alphabetically
            { $sort: { vehicleType: 1 } }
        ]);

        res.status(200).json({
            status: "success",
            data: valuationData
        });

    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

module.exports = {
    getInventoryValuation
};