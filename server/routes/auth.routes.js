// File: routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth.controller.js');

// Becomes POST /api/auth/register
router.post('/auth/register', registerUser);

// Becomes POST /api/auth/login
router.post('/auth/login', loginUser);

module.exports = router;