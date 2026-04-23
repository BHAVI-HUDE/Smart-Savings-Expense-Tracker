const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getBudget = async (req, res) => {
  try {
    const month = String(req.query.month || getCurrentMonth()).trim();

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Month must be YYYY-MM");
    }

    const budget = await Budget.findOne({ userId: req.user, month });

    const [expenseData] = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          createdAt: {
            $gte: new Date(`${month}-01T00:00:00.000Z`),
            $lt: new Date(new Date(`${month}-01T00:00:00.000Z`).setMonth(new Date(`${month}-01T00:00:00.000Z`).getMonth() + 1)),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyExpense = expenseData?.total || 0;
    const budgetAmount = budget?.amount || 0;
    const remaining = budgetAmount - monthlyExpense;

    return res.json({
      month,
      budget: budgetAmount,
      monthlyExpense,
      remaining,
      status: budgetAmount === 0 ? "not_set" : remaining < 0 ? "over_budget" : remaining < budgetAmount * 0.2 ? "warning" : "ok",
    });
  } catch (err) {
    console.error("Get budget error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const upsertBudget = async (req, res) => {
  try {
    const month = String(req.body.month || getCurrentMonth()).trim();
    const amount = Number(req.body.amount);

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Month must be YYYY-MM");
    }

    if (!Number.isFinite(amount) || amount < 0) {
      return sendError(res, 400, "VALIDATION_ERROR", "Amount must be a non-negative number");
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user, month },
      { amount },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(budget);
  } catch (err) {
    console.error("Upsert budget error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

module.exports = {
  getBudget,
  upsertBudget,
};