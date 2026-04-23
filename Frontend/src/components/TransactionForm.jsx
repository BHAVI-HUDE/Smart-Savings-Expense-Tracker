import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    notes: "",
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async (type = form.type) => {
    const { data } = await API.get(`/categories?type=${type}`);
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCategories(form.type);
  }, [form.type]);

  const categoryOptions = useMemo(() => categories.map((cat) => cat.name), [categories]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      alert("Amount must be a positive number");
      return;
    }

    if (!form.category.trim()) {
      alert("Category is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await API.post("/transactions", form);
      onAdd();
      setForm({ amount: "", type: "expense", category: "", notes: "" });
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await API.post("/categories", { name: newCategory.trim(), type: form.type });
      setNewCategory("");
      loadCategories(form.type);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save category");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>

      <input
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        placeholder="Category"
        list="category-options"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <datalist id="category-options">
        {categoryOptions.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      <div className="inline-input">
        <input
          placeholder="Add custom category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          type="text"
        />
        <button type="button" onClick={handleAddCategory}>
          Add Category
        </button>
      </div>

      <input
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

       <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
      
  );
}

export default TransactionForm;