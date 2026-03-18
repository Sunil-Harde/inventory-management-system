const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "No token provided. Please log in.",
      });
    }

    // 2. Extract and verify the token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in DB (in case account was deleted)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User no longer exists.",
      });
    }

    // 4. Attach user to request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired. Please log in again.",
      });
    }
    next(error);
  }
};

module.exports = { protect };