// File: routes/user.routes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers } = require('../controllers/user.controller.js');

router.get('/users/profile', getUserProfile);

router.get('/users', getAllUsers);

module.exports = router;