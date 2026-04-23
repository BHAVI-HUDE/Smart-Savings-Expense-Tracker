import { formatCurrency } from "../utils/currency";

function BudgetWidget({ budgetData, onBudgetChange, onBudgetSave }) {
  const { month, budget, monthlyExpense, remaining, status } = budgetData;

  return (
    <div className="budget-widget">
      <h3>Budget vs Actual ({month})</h3>
      <div className="budget-grid">
        <div>
          <p>Budget</p>
          <strong>{formatCurrency(budget)}</strong>
        </div>
        <div>
          <p>Actual spent</p>
          <strong>{formatCurrency(monthlyExpense)}</strong>
        </div>
        <div>
          <p>Remaining</p>
          <strong className={remaining < 0 ? "danger" : "success"}>{formatCurrency(remaining)}</strong>
        </div>
      </div>

      {status === "warning" && <p className="warning">Warning: you are close to your monthly budget limit.</p>}
      {status === "over_budget" && <p className="danger">Alert: you are over budget this month.</p>}
      {status === "not_set" && <p className="warning">Set a monthly budget to start tracking remaining budget.</p>}

      <div className="budget-form-row">
        <input type="number" min="0" step="0.01" placeholder="Set monthly budget" onChange={(e) => onBudgetChange(e.target.value)} />
        <button onClick={onBudgetSave}>Save Budget</button>
      </div>
    </div>
  );
}

export default BudgetWidget;