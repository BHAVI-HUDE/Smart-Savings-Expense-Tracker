const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
  getCategoryTrends,
  getCategoryBreakdown,
} = require("../controllers/transactionController");

router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, deleteTransaction);
router.put("/:id", protect, updateTransaction);

router.get("/summary", protect, getSummary);
router.get("/insights/category-trends", protect, getCategoryTrends);
router.get("/insights/category-breakdown", protect, getCategoryBreakdown);

module.exports = router;