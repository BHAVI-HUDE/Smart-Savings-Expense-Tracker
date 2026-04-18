const Transaction = require("../models/Transaction");

// Add
const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, notes } = req.body;

    const transaction = await Transaction.create({
      userId: req.user,
      amount,
      type,
      category,
      notes,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get
const getTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.user })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete
const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getSummary,
};