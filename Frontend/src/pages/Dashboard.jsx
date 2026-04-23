import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import TransactionForm from "../components/TransactionForm";
import ExpenseChart from "../components/ExpenseChart";
import TransactionList from "../components/TransactionList";
import BudgetWidget from "../components/BudgetWidget";
import CategoryInsights from "../components/CategoryInsights";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../services/auth";
import { formatCurrency } from "../utils/currency";
import "../styles/dashboard.css";

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 8 });
  const [filters, setFilters] = useState({ from: "", to: "", preset: "thisMonth" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [breakdown, setBreakdown] = useState([]);
  const [budgetData, setBudgetData] = useState({ month: getCurrentMonth(), budget: 0, monthlyExpense: 0, remaining: 0, status: "not_set" });
  const [budgetInput, setBudgetInput] = useState("");

  const navigate = useNavigate();

  const resolvedFilters = useMemo(() => {
    const now = new Date();
    if (filters.preset === "thisMonth") {
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
      };
    }
    if (filters.preset === "last30") {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
    }
    return { from: filters.from, to: filters.to };
  }, [filters]);

  const fetchData = useCallback(
    async (page = meta.page) => {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(meta.limit),
          sortBy,
          sortOrder,
        });

        if (resolvedFilters.from) query.append("from", resolvedFilters.from);
        if (resolvedFilters.to) query.append("to", resolvedFilters.to);

        const [summaryResponse, transactionsResponse, budgetResponse, breakdownResponse] = await Promise.all([
          API.get("/transactions/summary"),
          API.get(`/transactions?${query.toString()}`),
          API.get(`/budgets/monthly?month=${getCurrentMonth()}`),
          API.get(`/transactions/insights/category-breakdown?month=${getCurrentMonth()}`),
        ]);

        setSummary(summaryResponse.data);
        setTransactions(transactionsResponse.data.data);
        setMeta(transactionsResponse.data.meta);
        setBudgetData(budgetResponse.data);
        setBreakdown(breakdownResponse.data);
      } catch (err) {
        console.log(err);
        if (err.response?.status === 401) {
          clearToken();
          navigate("/");
        }
      }
    },
    [navigate, resolvedFilters.from, resolvedFilters.to, sortBy, sortOrder, meta.limit, meta.page]
  );

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }

    fetchData(1);
  }, [fetchData, navigate]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchData(meta.page);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const handleUpdate = async (id, payload) => {
    try {
      await API.put(`/transactions/${id}`, payload);
      fetchData(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update transaction");
    }
  };

  const handleSortChange = (nextSortBy) => {
    if (sortBy === nextSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder("desc");
    }
  };

  const handleBudgetSave = async () => {
    try {
      await API.post("/budgets/monthly", { month: getCurrentMonth(), amount: Number(budgetInput || 0) });
      setBudgetInput("");
      fetchData(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save budget");
    }
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
            <h3>{formatCurrency(summary.totalIncome)}</h3>
          </div>

          <div className="summary-card">
            <p>Expense</p>
            <h3>{formatCurrency(summary.totalExpense)}</h3>
          </div>

          <div className="summary-card">
            <p>Balance</p>
            <h3>{formatCurrency(summary.balance)}</h3>
          </div>
        </div>

        <div className="section">
          <BudgetWidget budgetData={budgetData} onBudgetChange={setBudgetInput} onBudgetSave={handleBudgetSave} />
        </div>

        <div className="section">
          <TransactionForm onAdd={() => fetchData(1)} />
        </div>

        <div className="section">
          <h3>Filters</h3>
          <div className="filters-row">
            <button onClick={() => setFilters({ ...filters, preset: "thisMonth" })}>This month</button>
            <button onClick={() => setFilters({ ...filters, preset: "last30" })}>Last 30 days</button>
            <button onClick={() => setFilters({ ...filters, preset: "custom" })}>Custom range</button>
            {filters.preset === "custom" && (
              <>
                <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
              </>
            )}
            <button onClick={() => fetchData(1)}>Apply</button>
          </div>
        </div>

        <div className="section">
          <h3>Expense Breakdown</h3>
          <ExpenseChart breakdown={breakdown} />
        </div>

        <div className="section">
          <CategoryInsights breakdown={breakdown} />
        </div>
      </div>

      <div className="section">
        <h3>Transactions</h3>
        <TransactionList
          transactions={transactions}
          meta={meta}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={fetchData}
        />
      </div>
    </div>
  );
}

export default Dashboard;