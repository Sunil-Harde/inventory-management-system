// File: controllers/auth.controller.js
const User = require('../models/User.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: generate JWT token (FIXED: Using a hardcoded string for local testing)
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        "my_temporary_super_secret_key_123", // <-- The fix!
        { expiresIn: '30d' }
    );
};


// 1. Register a new user (Updated to accept role from frontend)
const registerUser = async (req, res) => {
    try {
        // NEW: We are now extracting 'role' from the frontend request
        const { name, email, password, role } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide name, email and password"
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: "fail",
                message: "User already exists"
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // SAFETY CHECK: Ensure the role perfectly matches your Mongoose Schema
        // If the frontend sends 'admin' (case-insensitive), make them an admin.
        // Otherwise, default them to 'staff' to prevent database errors.
        const assignedRole = (role && role.toLowerCase() === 'admin') ? 'admin' : 'staff';

        // Create user with the frontend's requested role
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole // <-- This is the magic line!
        });

        res.status(201).json({
            status: "success",
            message: `${assignedRole.toUpperCase()} registered successfully`,
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.log("REGISTER ERROR:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ status: "fail", message: err.message });
        }
        res.status(500).json({ status: "error", message: "Server error during registration" });
    }
};

// 2. Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide email and password"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid email or password"
            });
        }

        // Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid email or password"
            });
        }

        // Generate token and send response
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err); // <-- Added for debugging
        res.status(500).json({ status: "error", message: "Server error during login" });
    }
};

// 3. Get logged-in user profile
const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            data: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (err) {
        console.log("PROFILE ERROR:", err); // <-- Added for debugging
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// 4. Delete a user (DELETE)
const deleteUser = async (req, res) => {
    try {
        // Extract the ID from the URL (e.g., /api/users/:id)
        const userId = req.params.id;

        // Step 1: Check if the user actually exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found!"
            });
        }

        // Step 2: Delete the user from the database
        await User.findByIdAndDelete(userId);

        // Step 3: Send a success response
        res.status(200).json({
            status: "success",
            message: "User successfully deleted."
        });

    } catch (err) {
        console.log("DELETE USER ERROR:", err);
        // Handle the specific error where a frontend sends an invalid MongoDB ID format
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ status: "fail", message: "Invalid user ID format." });
        }
        res.status(500).json({ status: "error", message: "Server error during deletion." });
    }
};

module.exports = { registerUser, loginUser, getProfile, deleteUser };