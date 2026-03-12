const express = require("express");
const router = express.Router();
const { getInventoryValuation } = require("../controllers/report.controller.js");

// This automatically becomes: GET /api/reports/valuation
router.get("/reports/valuation", getInventoryValuation);

module.exports = router;