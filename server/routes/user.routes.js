// File: routes/user.routes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers } = require('../controllers/user.controller.js');

// Becomes GET /api/users/profile
router.get('/users/profile', getUserProfile);

// Becomes GET /api/users
router.get('/users', getAllUsers);

module.exports = router;