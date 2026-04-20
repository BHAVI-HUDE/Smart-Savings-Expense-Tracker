import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import TransactionForm from "../components/TransactionForm";
import ExpenseChart from "../components/ExpenseChart";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../services/auth";
import "../styles/dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [summaryResponse, transactionsResponse] = await Promise.all([
        API.get("/transactions/summary"),
        API.get("/transactions"),
      ]);

      setSummary(summaryResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        clearToken();
        navigate("/");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData, navigate]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Dashboard</h2>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

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

        <div className="section">
          <TransactionForm onAdd={fetchData} />
        </div>

        <div className="section">
          <h3>Expense Breakdown</h3>
          <ExpenseChart data={transactions} />
        </div>

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

                <button className="delete-btn" onClick={() => handleDelete(t._id)}>
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
