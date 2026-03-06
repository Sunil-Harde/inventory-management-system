const express = require("express")
const route = express.Router()
const authController = require('../controllers/auth.controller')

route.get("/register", authController.getRegisterPage)
route.get("/login", authController.getLoginPage)

