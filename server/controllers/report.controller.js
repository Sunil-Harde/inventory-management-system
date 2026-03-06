const Product = require("../models/products.module"); // Make sure your Product schema is imported!

const getInventoryValuation = async (req, res) => {
    try {
        const valuationData = await Product.aggregate([
            { $unwind: "$vehicleType" },

            {
                $group: {
                    _id: "$vehicleType",
                    totalStock: { $sum: "$currentStock" },
                    totalValue: { $sum: { $multiply: ["$currentStock", "$price"] } }
                }
            },

            {
                $project: {
                    _id: 0,
                    vehicleType: "$_id",
                    totalStock: 1,
                    totalValue: 1
                }
            },

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