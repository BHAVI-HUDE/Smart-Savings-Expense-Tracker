import { useState } from "react";

function TransactionList({ 
  transactions = [],
  meta = { page: 1, totalPages: 1},
  onDelete, 
  onUpdate,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange, 
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      notes: transaction.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      amount: "",
      type: "expense",
      category: "",
      notes: "",
    });
  };

  const submitEdit = async (event, id) => {
    event.preventDefault();

    if (!Number.isFinite(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      alert("Amount must be a positive number");
      return;
    }

    if (!editForm.category.trim()) {
      alert("Category is required");
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(id, {
        amount: Number(editForm.amount),
        type: editForm.type,
        category: editForm.category.trim(),
        notes: editForm.notes.trim(),
      });
      cancelEditing();
    } finally {
      setIsSaving(false);
    }
  };

  if (!transactions.length) {
    return <div className="empty-state">No transactions found for this filter range.</div>;
  }

  const columns = [
  { key: "createdAt", label: "Date" },
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount" },
];

const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

  return (
    <div>
      <div className="table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  <button className="sort-btn" onClick={() => onSortChange(col.key)}>
                    {col.label}
                    {sortBy === col.key ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) =>
              editingId === transaction._id ? (
                <tr key={transaction._id}>
                  <td colSpan={6}>
                    <form className="transaction-edit-form" onSubmit={(event) => submitEdit(event, transaction._id)}>
                      <input
                        placeholder="Amount"
                        value={editForm.amount}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))}
                      />
                      <select
                        value={editForm.type}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, type: event.target.value }))}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <input
                        placeholder="Category"
                        value={editForm.category}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                      />
                      <input
                        placeholder="Notes"
                        value={editForm.notes}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                      />
                      <div className="transaction-actions">
                        <button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={cancelEditing} disabled={isSaving}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td>{transaction.category}</td>
                  <td className={transaction.type === "income" ? "income" : "expense"}>{transaction.type}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>{transaction.notes || "-"}</td>
                  <td>
                    <div className="transaction-actions">
                      <button type="button" onClick={() => startEditing(transaction)}>
                        Edit
                      </button>
                      <button className="delete-btn" type="button" onClick={() => onDelete(transaction._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </button>
        <span>
          Page {meta.page} of {meta.totalPages}
        </span>
        <button disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default TransactionList;