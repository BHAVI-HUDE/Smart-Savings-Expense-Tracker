const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Add
const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, notes } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be either income or expense" });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    const transaction = await Transaction.create({
      userId: req.user,
      amount: parsedAmount,
      type,
      category: String(category).trim(),
      notes,
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Add transaction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get
const getTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.user })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete
const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getSummary,
};