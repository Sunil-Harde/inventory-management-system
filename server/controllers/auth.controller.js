// File: controllers/auth.controller.js
const User = require('../models/User.module.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ status: "fail", message: "User already exists" });
        }

        // Hash the password before saving!
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user with the scrambled password
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: { _id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// 2. Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: "fail", message: "Invalid email or password" });
        }

        // Compare the typed password with the hashed password in MongoDB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "fail", message: "Invalid email or password" });
        }

        // If password is correct, generate the VIP Pass (JWT Token)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day
        );

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token: token, // React will save this token!
            user: { _id: user._id, name: user.name, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

module.exports = { registerUser, loginUser };