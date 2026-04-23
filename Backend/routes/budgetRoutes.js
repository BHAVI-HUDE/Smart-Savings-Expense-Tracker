const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { getBudget, upsertBudget } = require("../controllers/budgetController");

router.get("/monthly", protect, getBudget);
router.post("/monthly", protect, upsertBudget);

module.exports = router;