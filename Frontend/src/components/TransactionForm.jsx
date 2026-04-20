import { useState } from "react";
import API from "../services/api";

function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    notes: "",
  });
   const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>

      <input
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

       <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
       >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        placeholder="Category"
         value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

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