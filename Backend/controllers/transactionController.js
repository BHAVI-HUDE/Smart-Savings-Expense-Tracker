const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");

const parseMonthRange = (month) => {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

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
    const { type, category, from, to, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const filters = { userId: req.user };

    if (type && ["income", "expense"].includes(type)) {
      filters.type = type;
    }

    if (category && category.trim()) {
      filters.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (from || to) {
      filters.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return sendError(res, 400, "VALIDATION_ERROR", "Invalid from date");
        }
        filters.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return sendError(res, 400, "VALIDATION_ERROR", "Invalid to date");
        }

        toDate.setHours(23, 59, 59, 999);
        filters.createdAt.$lte = toDate;
      }
    }

     const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;

    const allowedSorts = ["createdAt", "amount", "category", "type"];
    const selectedSort = allowedSorts.includes(sortBy) ? sortBy : "createdAt";
    const selectedOrder = sortOrder === "asc" ? 1 : -1;

     const [data, total] = await Promise.all([
      Transaction.find(filters)
        .sort({ [selectedSort]: selectedOrder })
        .skip(skip)
        .limit(safeLimit),
      Transaction.countDocuments(filters),
    ]);

    res.json({
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    });
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

const updateTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid transaction id");
    }

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

    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user,
      },
      {
        amount,
        type,
        category,
        notes,
      },
      { new: true }
    );

    if (!updatedTransaction) {
      return sendError(res, 404, "TRANSACTION_NOT_FOUND", "Transaction not found");
    }

    return res.json(updatedTransaction);
  } catch (err) {
    console.error("Update transaction error:", err);
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

const getCategoryTrends = async (req, res) => {
  try {
    const month = String(req.query.month || new Date().toISOString().slice(0, 7));

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Month must be YYYY-MM");
    }

    const { start, end } = parseMonthRange(month);

    const trendData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json(trendData);
  } catch (err) {
    console.error("Get category trends error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const month = String(req.query.month || new Date().toISOString().slice(0, 7));

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Month must be YYYY-MM");
    }

    const { start, end } = parseMonthRange(month);

    const data = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          createdAt: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
    const formatted = data.map((item) => ({
      category: item._id,
      total: item.total,
      share: grandTotal === 0 ? 0 : Number(((item.total / grandTotal) * 100).toFixed(2)),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get category breakdown error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};


module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
  getCategoryTrends,
  getCategoryBreakdown,
};