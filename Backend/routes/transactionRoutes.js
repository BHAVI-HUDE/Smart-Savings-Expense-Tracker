const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");

const {addTransaction, getTransactions, deleteTransaction, getSummary} 
    = require("../controllers/transactionController");

router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, deleteTransaction);

router.get("/summary", protect, getSummary);

module.exports = router;