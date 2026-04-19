import { useEffect, useState } from "react";
import API from "../services/api";
import TransactionForm from "../components/TransactionForm";
import ExpenseChart from "../components/ExpenseChart";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res1 = await API.get("/transactions/summary", config);
      const res2 = await API.get("/transactions", config);

      setSummary(res1.data);
      setTransactions(res2.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await API.delete(`/transactions/${id}`, config);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
  <div className="dashboard-container">
    <div className="dashboard-card">

      <h2>Dashboard</h2>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* Summary */}
      <div className="summary-container">
        <div className="summary-card">
          <p>Income</p>
          <h3>₹{summary.totalIncome || 0}</h3>
        </div>

        <div className="summary-card">
          <p>Expense</p>
          <h3>₹{summary.totalExpense || 0}</h3>
        </div>

        <div className="summary-card">
          <p>Balance</p>
          <h3>₹{summary.balance || 0}</h3>
        </div>
      </div>

      {/* Form */}
      <div className="section">
        <TransactionForm onAdd={fetchData} />
      </div>

      {/* Chart */}
      <div className="section">
        <h3>Expense Breakdown</h3>
        <ExpenseChart data={transactions} />
      </div>

      {/* Transactions */}
      <div className="section">
        <h3>Transactions</h3>

        {transactions.length === 0 ? (
          <p>No transactions</p>
        ) : (
          transactions.map((t) => (
            <div key={t._id} className="transaction-item">
              <span>
                {t.category} - ₹{t.amount} ({t.type})
              </span>

              <button
                className="delete-btn"
                onClick={() => handleDelete(t._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  </div>
);
}

export default Dashboard;