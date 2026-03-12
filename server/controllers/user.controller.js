// File: controllers/user.controller.js
const User = require('../models/User.module.js');

// 1. Get Logged-In User's Profile (GET)
const getUserProfile = async (req, res) => {
    try {
        // We will get req.user.id from the JWT token later!
        // For testing right now, you can just hardcode an ID you created.
        const userId = req.user ? req.user.id : req.body.testId; 

        // Find the user, but exclude the password from the result
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: user
        });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// 2. Get All Users - Admin Only (GET)
const getAllUsers = async (req, res) => {
    try {
        // Fetch all staff members, excluding their passwords
        const users = await User.find().select('-password');

        res.status(200).json({
            status: "success",
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

module.exports = {
    getUserProfile,
    getAllUsers
};