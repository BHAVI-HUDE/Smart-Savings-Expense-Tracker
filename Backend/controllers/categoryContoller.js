const Category = require("../models/Category");
const sendError = require("../utils/sendError");

const PRESET_CATEGORIES = [
  { name: "Food", type: "expense", source: "preset" },
  { name: "Rent", type: "expense", source: "preset" },
  { name: "Transport", type: "expense", source: "preset" },
  { name: "Utilities", type: "expense", source: "preset" },
  { name: "Shopping", type: "expense", source: "preset" },
  { name: "Entertainment", type: "expense", source: "preset" },
  { name: "Healthcare", type: "expense", source: "preset" },
  { name: "Salary", type: "income", source: "preset" },
  { name: "Freelance", type: "income", source: "preset" },
  { name: "Investment", type: "income", source: "preset" },
];

const getCategories = async (req, res) => {
  try {
    const type = String(req.query.type || "").trim().toLowerCase();

    const userCategories = await Category.find({ userId: req.user }).sort({ name: 1 }).lean();

    const custom = userCategories.map((cat) => ({
      ...cat,
      source: "custom",
    }));

    const merged = [...PRESET_CATEGORIES, ...custom].filter((cat) => {
      if (!type) return true;
      return cat.type === type || cat.type === "both";
    });

    const deduped = Array.from(new Map(merged.map((cat) => [cat.name.toLowerCase(), cat])).values());

    res.json(deduped);
  } catch (err) {
    console.error("Get categories error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const addCategory = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const type = String(req.body.type || "expense").trim().toLowerCase();

    if (!name) {
      return sendError(res, 400, "VALIDATION_ERROR", "Category name is required");
    }

    if (!["income", "expense", "both"].includes(type)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Category type must be income, expense, or both");
    }

    const existingPreset = PRESET_CATEGORIES.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
    if (existingPreset) {
      return res.status(200).json({ ...existingPreset, message: "Category already exists as preset" });
    }

    const category = await Category.findOneAndUpdate(
      { userId: req.user, name },
      { type },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ ...category.toObject(), source: "custom" });
  } catch (err) {
    console.error("Add category error:", err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

module.exports = {
  getCategories,
  addCategory,
  PRESET_CATEGORIES,
};