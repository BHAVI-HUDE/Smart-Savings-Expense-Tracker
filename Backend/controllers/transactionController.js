const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");

const addTransaction = async (req, res) => {
  try {
      const amount = Number(req.body.amount);
      const type = String(req.body.type || "").trim().toLowerCase();
      const category = String(req.body.category || "").trim();
      const notes = String(req.body.notes || "").trim();

      if (!Number.isFinite(amount) || amount <= 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "Amount must be a positive number");
      }

      if (!type || !["income", "expense"].includes(type)) {
        return sendError(res, 400, "VALIDATION_ERROR", "Type must be either income or expense");
      }

      if (!category) {
        return sendError(res, 400, "VALIDATION_ERROR", "Category is required");
      }
      const transaction = await Transaction.create({
        userId: req.user,
        amount,
        type,
        category,
        notes,
      });

      res.status(201).json(transaction);
  } catch (err) {
    console.error("Add transaction error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const getTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.user }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("Get transactions error:", err);
     return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};


const deleteTransaction = async (req, res) => {
  try {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid transaction id");
    }

    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!deleted) {
     return sendError(res, 404, "TRANSACTION_NOT_FOUND", "Transaction not found");
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const getSummary = async (req, res) => {
  try {
    const totals = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const income = totals.find((item) => item._id === "income")?.total || 0;
    const expense = totals.find((item) => item._id === "expense")?.total || 0;

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });
  } catch (err) {
    console.error("Get summary error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getSummary,
};