import { useState } from "react";
import API from "../services/api";

function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    notes: "",
  });

  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await API.post("/transactions", form, config);

      onAdd(); // refresh data
      setForm({ amount: "", type: "expense", category: "", notes: "" });

    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Failed to add transaction");
    }
  };

  return (
    <div>
      <h3>Add Transaction</h3>

      <input
        placeholder="Amount"
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <select onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        placeholder="Category"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input
        placeholder="Notes"
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

export default TransactionForm;