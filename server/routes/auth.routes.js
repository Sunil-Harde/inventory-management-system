const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, deleteUser } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);

// NEW: The :id acts as a placeholder for the actual user ID
router.delete('/users/:id', deleteUser); 

module.exports = router;